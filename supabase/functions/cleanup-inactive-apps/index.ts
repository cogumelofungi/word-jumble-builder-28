import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[CLEANUP-INACTIVE-APPS] Function started');

    // Verificar variáveis de ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[CLEANUP-INACTIVE-APPS] Missing environment variables');
      throw new Error('Missing required environment variables');
    }

    // Criar cliente Supabase com service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[CLEANUP-INACTIVE-APPS] Supabase client initialized');

    // Buscar configurações de limpeza automática
    const { data: settingsData, error: settingsError } = await supabase
      .from('admin_settings')
      .select('key, value')
      .in('key', ['auto_cleanup_enabled', 'auto_cleanup_days', 'cleanup_notification_enabled', 'cleanup_notification_days']);

    if (settingsError) {
      console.error('[CLEANUP-INACTIVE-APPS] Error fetching settings:', settingsError);
      throw settingsError;
    }

    console.log('[CLEANUP-INACTIVE-APPS] Settings fetched:', settingsData);

    // Processar configurações
    const settings = settingsData.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    const autoCleanupEnabled = settings.auto_cleanup_enabled === 'true';
    const cleanupDays = parseInt(settings.auto_cleanup_days || '30');
    const notificationEnabled = settings.cleanup_notification_enabled === 'true';
    const notificationDays = parseInt(settings.cleanup_notification_days || '7');

    console.log('[CLEANUP-INACTIVE-APPS] Processed settings:', {
      autoCleanupEnabled,
      cleanupDays,
      notificationEnabled,
      notificationDays
    });

    if (!autoCleanupEnabled) {
      console.log('[CLEANUP-INACTIVE-APPS] Auto cleanup is disabled');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Auto cleanup is disabled',
        processed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calcular data limite para limpeza
    const cleanupDate = new Date();
    cleanupDate.setDate(cleanupDate.getDate() - cleanupDays);

    // Calcular data limite para notificação
    const notificationDate = new Date();
    notificationDate.setDate(notificationDate.getDate() - (cleanupDays - notificationDays));

    console.log('[CLEANUP-INACTIVE-APPS] Date thresholds:', {
      cleanupDate: cleanupDate.toISOString(),
      notificationDate: notificationDate.toISOString()
    });

    // Buscar contas inativas que precisam de limpeza
    const { data: inactiveUsers, error: usersError } = await supabase
      .from('user_status')
      .select(`
        user_id,
        is_active,
        updated_at,
        profiles!inner(email, full_name)
      `)
      .eq('is_active', false)
      .lt('updated_at', cleanupDate.toISOString());

    if (usersError) {
      console.error('[CLEANUP-INACTIVE-APPS] Error fetching inactive users:', usersError);
      throw usersError;
    }

    console.log('[CLEANUP-INACTIVE-APPS] Found inactive users for cleanup:', inactiveUsers?.length || 0);

    let processedCount = 0;
    let notificationCount = 0;

    if (inactiveUsers && inactiveUsers.length > 0) {
      // Processar cada usuário inativo
      for (const user of inactiveUsers) {
        try {
          console.log(`[CLEANUP-INACTIVE-APPS] Processing user: ${user.user_id}`);

          // Buscar apps do usuário
          const { data: userApps, error: appsError } = await supabase
            .from('apps')
            .select('id, nome')
            .eq('user_id', user.user_id);

          if (appsError) {
            console.error(`[CLEANUP-INACTIVE-APPS] Error fetching apps for user ${user.user_id}:`, appsError);
            continue;
          }

          if (userApps && userApps.length > 0) {
            console.log(`[CLEANUP-INACTIVE-APPS] Found ${userApps.length} apps for user ${user.user_id}`);

            // Deletar apps do usuário
            const { error: deleteError } = await supabase
              .from('apps')
              .delete()
              .eq('user_id', user.user_id);

            if (deleteError) {
              console.error(`[CLEANUP-INACTIVE-APPS] Error deleting apps for user ${user.user_id}:`, deleteError);
              continue;
            }

            console.log(`[CLEANUP-INACTIVE-APPS] Successfully deleted ${userApps.length} apps for user ${user.user_id}`);
            processedCount++;

            // Log da ação administrativa
            await supabase
              .from('admin_audit_log')
              .insert({
                admin_user_id: null, // Sistema automático
                target_user_id: user.user_id,
                action: 'auto_cleanup_apps',
                details: {
                  apps_deleted: userApps.length,
                  inactive_since: user.updated_at,
                  cleanup_days: cleanupDays,
                  apps: userApps.map(app => ({ id: app.id, nome: app.nome }))
                }
              });

          } else {
            console.log(`[CLEANUP-INACTIVE-APPS] No apps found for user ${user.user_id}`);
          }

        } catch (error) {
          console.error(`[CLEANUP-INACTIVE-APPS] Error processing user ${user.user_id}:`, error);
          continue;
        }
      }
    }

    // Buscar usuários que precisam de notificação (se habilitado)
    if (notificationEnabled) {
      const { data: usersForNotification, error: notificationError } = await supabase
        .from('user_status')
        .select(`
          user_id,
          is_active,
          updated_at,
          profiles!inner(email, full_name)
        `)
        .eq('is_active', false)
        .lt('updated_at', notificationDate.toISOString())
        .gte('updated_at', cleanupDate.toISOString());

      if (!notificationError && usersForNotification && usersForNotification.length > 0) {
        console.log('[CLEANUP-INACTIVE-APPS] Found users for notification:', usersForNotification.length);
        
        // Aqui você pode implementar o envio de notificações
        // Por exemplo, enviar emails ou criar notificações internas
        for (const user of usersForNotification) {
          console.log(`[CLEANUP-INACTIVE-APPS] Should notify user: ${user.user_id} (${user.profiles.email})`);
          
          // Log da notificação
          await supabase
            .from('admin_audit_log')
            .insert({
              admin_user_id: null,
              target_user_id: user.user_id,
              action: 'cleanup_notification_sent',
              details: {
                notification_days: notificationDays,
                cleanup_in_days: cleanupDays - notificationDays,
                inactive_since: user.updated_at
              }
            });
          
          notificationCount++;
        }
      }
    }

    const result = {
      success: true,
      processed: processedCount,
      notifications_sent: notificationCount,
      cleanup_date: cleanupDate.toISOString(),
      settings: {
        auto_cleanup_enabled: autoCleanupEnabled,
        cleanup_days: cleanupDays,
        notification_enabled: notificationEnabled,
        notification_days: notificationDays
      }
    };

    console.log('[CLEANUP-INACTIVE-APPS] Cleanup completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[CLEANUP-INACTIVE-APPS] Function error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});