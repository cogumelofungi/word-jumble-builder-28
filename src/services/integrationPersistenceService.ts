import { supabase } from '@/integrations/supabase/client';

export interface UserIntegration {
  id: string;
  user_id: string;
  integration_type: string;
  config: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IntegrationConfig {
  apiUrl?: string;
  apiKey?: string;
  selectedList?: string;
  selectedTags?: string[];
  selectedAutomations?: Record<string, string>;
  makeWebhookUrl?: string;
  [key: string]: any;
}

export class IntegrationPersistenceService {
  async saveIntegration(type: string, config: IntegrationConfig) {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_integrations')
        .upsert({
          user_id: user.data.user.id,
          integration_type: type,
          config: config as any,
          is_active: true
        }, {
          onConflict: 'user_id,integration_type'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving integration:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to save integration:', error);
      throw error;
    }
  }

  async loadIntegration(type: string): Promise<IntegrationConfig | null> {
    try {
      const { data, error } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('integration_type', type)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error loading integration:', error);
        throw error;
      }

      return data ? (data.config as IntegrationConfig) : null;
    } catch (error) {
      console.error('Failed to load integration:', error);
      return null;
    }
  }

  async deleteIntegration(type: string) {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user?.id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('user_integrations')
        .update({ is_active: false })
        .eq('integration_type', type)
        .eq('user_id', user.data.user.id);

      if (error) {
        console.error('Error deleting integration:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to delete integration:', error);
      throw error;
    }
  }

  async getAllIntegrations(): Promise<UserIntegration[]> {
    try {
      const { data, error } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading integrations:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to load integrations:', error);
      return [];
    }
  }
}

export const integrationPersistenceService = new IntegrationPersistenceService();