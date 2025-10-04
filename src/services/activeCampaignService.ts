import { supabase } from '@/integrations/supabase/client';

export interface ActiveCampaignConfig {
  apiUrl: string;
  apiKey: string;
}

export interface ActiveCampaignList {
  id: string;
  name: string;
  subscriber_count?: number;
}

export interface ActiveCampaignTag {
  id: string;
  tag: string;
}

export interface ActiveCampaignAutomation {
  id: string;
  name: string;
  type: 'automation' | 'tag' | 'campaign';
}

export class ActiveCampaignService {
  private async callFunction(functionName: string, payload: any) {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error(`Error calling ${functionName}:`, error);
      throw error;
    }
  }

  async testConnection(config: ActiveCampaignConfig) {
    return this.callFunction('activecampaign-api', {
      action: 'test-connection',
      apiUrl: config.apiUrl,
      apiKey: config.apiKey
    });
  }

  async getLists(config: ActiveCampaignConfig): Promise<ActiveCampaignList[]> {
    const result = await this.callFunction('activecampaign-api', {
      action: 'get-lists',
      apiUrl: config.apiUrl,
      apiKey: config.apiKey
    });

    if (result.success && result.data?.lists) {
      return result.data.lists;
    }

    // Fallback para dados demo se a API falhar
    return [
      { id: 'demo-1', name: '📋 Newsletter Subscribers (DEMO)', subscriber_count: 1250 },
      { id: 'demo-2', name: '⭐ VIP Customers (DEMO)', subscriber_count: 120 },
      { id: 'demo-3', name: '🔄 Trial Users (DEMO)', subscriber_count: 450 },
      { id: 'demo-4', name: '🎯 Prospects (DEMO)', subscriber_count: 850 }
    ];
  }

  async getTags(config: ActiveCampaignConfig): Promise<ActiveCampaignTag[]> {
    const result = await this.callFunction('activecampaign-api', {
      action: 'get-tags',
      apiUrl: config.apiUrl,
      apiKey: config.apiKey
    });

    if (result.success && result.data?.tags) {
      return result.data.tags;
    }

    // Fallback para dados demo se a API falhar
    return [
      { id: 'demo-1', tag: '👤 cliente (DEMO)' },
      { id: 'demo-2', tag: '🎯 prospect (DEMO)' },
      { id: 'demo-3', tag: '📧 lead (DEMO)' },
      { id: 'demo-4', tag: '⭐ vip (DEMO)' },
      { id: 'demo-5', tag: '🔄 trial (DEMO)' },
      { id: 'demo-6', tag: '📰 newsletter (DEMO)' }
    ];
  }

  async getAutomations(config: ActiveCampaignConfig): Promise<ActiveCampaignAutomation[]> {
    const result = await this.callFunction('activecampaign-api', {
      action: 'get-automations',
      apiUrl: config.apiUrl,
      apiKey: config.apiKey
    });

    if (result.success && result.data?.automations) {
      return result.data.automations;
    }

    // Fallback para dados demo se a API falhar
    return [
      { id: 'demo-auto-1', name: '🎉 Boas-vindas para novos clientes (DEMO)', type: 'automation' },
      { id: 'demo-auto-2', name: '📦 Sequência pós-compra (DEMO)', type: 'automation' },
      { id: 'demo-auto-3', name: '🔄 Reativação de clientes inativos (DEMO)', type: 'automation' },
      { id: 'demo-tag-1', name: '⭐ Cliente VIP (DEMO)', type: 'tag' },
      { id: 'demo-tag-2', name: '🔁 Comprador recorrente (DEMO)', type: 'tag' },
      { id: 'demo-camp-1', name: '📰 Newsletter mensal (DEMO)', type: 'campaign' },
      { id: 'demo-camp-2', name: '🎁 Ofertas especiais (DEMO)', type: 'campaign' }
    ];
  }

  async addContact(config: ActiveCampaignConfig, contactData: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) {
    return this.callFunction('activecampaign-api', {
      action: 'add-contact',
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      ...contactData
    });
  }
}

export const activeCampaignService = new ActiveCampaignService();