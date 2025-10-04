import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserPlan {
  name: string;
  app_limit: number;
}

interface AppLimitInfo {
  currentApps: number;
  maxApps: number;
  planName: string;
  canCreateApp: boolean;
  isLoading: boolean;
}

export const useAppLimit = () => {
  const [limitInfo, setLimitInfo] = useState<AppLimitInfo>({
    currentApps: 0,
    maxApps: 1,
    planName: 'Essencial',
    canCreateApp: true,
    isLoading: true
  });

  const checkAppLimit = async (slugToCheck?: string) => {
    try {
      setLimitInfo(prev => ({ ...prev, isLoading: true }));
      
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        setLimitInfo(prev => ({ ...prev, isLoading: false, canCreateApp: false }));
        return;
      }

      // Buscar plano do usuário
      const { data: userStatus, error: userError } = await supabase
        .from('user_status')
        .select(`
          plans (
            name,
            app_limit
          )
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Erro ao buscar plano do usuário:', userError);
      }

      const plan: UserPlan = userStatus?.plans || { name: 'Essencial', app_limit: 1 };

      // Se tem slug para verificar, checar se é do próprio usuário
      let isUpdatingOwnApp = false;
      if (slugToCheck && slugToCheck.trim()) {
        const { data: existingApp } = await supabase
          .from('apps')
          .select('user_id')
          .eq('slug', slugToCheck.trim())
          .eq('user_id', user.id)
          .maybeSingle();
        
        isUpdatingOwnApp = !!existingApp;
      }

      // Contar apps publicados do usuário
      const { data: apps, error: appsError } = await supabase
        .from('apps')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'publicado');

      if (appsError) {
        console.error('Erro ao contar apps:', appsError);
        setLimitInfo(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const currentApps = apps?.length || 0;
      // Se está atualizando um app próprio, permitir mesmo se atingiu o limite
      const canCreateApp = isUpdatingOwnApp || currentApps < plan.app_limit;

      setLimitInfo({
        currentApps,
        maxApps: plan.app_limit,
        planName: plan.name,
        canCreateApp,
        isLoading: false
      });

    } catch (error) {
      console.error('Erro ao verificar limite de apps:', error);
      setLimitInfo(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    checkAppLimit();
  }, []);

  return {
    ...limitInfo,
    refreshLimit: checkAppLimit
  };
};