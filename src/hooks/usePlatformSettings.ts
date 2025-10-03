import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PlatformSettings {
  platform_name: string;
  platform_description: string;
  default_language: string;
}

export const usePlatformSettings = () => {
  const [settings, setSettings] = useState<PlatformSettings>({
    platform_name: 'MigraBook',
    platform_description: 'Crie e publique seus apps facilmente',
    default_language: 'pt'
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value')
        .in('key', ['platform_name', 'platform_description', 'default_language']);

      if (error) {
        console.error('Error fetching platform settings:', error);
        return;
      }

      if (data && data.length > 0) {
        const newSettings = {
          platform_name: 'MigraBook',
          platform_description: 'Crie e publique seus apps facilmente',
          default_language: 'pt'
        };
        
        data.forEach(({ key, value }) => {
          if (key === 'platform_name') newSettings.platform_name = value || 'MigraBook';
          if (key === 'platform_description') newSettings.platform_description = value || 'Crie e publique seus apps facilmente';
          if (key === 'default_language') newSettings.default_language = value || 'pt';
        });
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Error in fetchSettings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Listen for changes in admin_settings table
  useEffect(() => {
    const channel = supabase
      .channel('admin_settings_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'admin_settings',
          filter: 'key=in.(platform_name,platform_description,default_language)'
        }, 
        () => {
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSettings]);

  return {
    platformName: settings.platform_name,
    platformDescription: settings.platform_description,
    defaultLanguage: settings.default_language,
    isLoading,
    refetch: fetchSettings
  };
};