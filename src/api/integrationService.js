// Mock data para integrationService - formato Supabase
const mockIntegrations = [
  {
    id: 'integration-activecampaign',
    name: 'ActiveCampaign',
    is_active: true,
    config: {
      api_url: 'https://account.api-us1.com',
      api_key: 'encrypted_api_key',
      default_list_id: '1'
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'integration-make',
    name: 'Make (Integromat)',
    is_active: false,
    config: {
      webhook_url: 'https://hook.integromat.com/webhook',
      api_token: 'encrypted_token'
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'integration-zapier',
    name: 'Zapier',
    is_active: false,
    config: {
      webhook_url: 'https://hooks.zapier.com/hooks/catch',
      api_key: 'encrypted_key'
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockWebhookLogs = [
  {
    id: 'log-1',
    integration_name: 'ActiveCampaign',
    event_type: 'contact_created',
    status: 'success',
    payload: {
      email: 'user@example.com',
      name: 'João Silva',
      phone: '+5511999999999'
    },
    response: {
      status: 200,
      data: { contact_id: '123' }
    },
    created_at: '2024-01-01T00:00:00Z'
  }
];

export const integrationService = {
  // Listar integrações disponíveis
  async getAvailableIntegrations() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const availableIntegrations = [
          {
            id: 'activecampaign',
            name: 'ActiveCampaign',
            description: 'Email marketing e automação',
            logo_url: '/integrations/activecampaign-logo.png',
            fields: [
              { name: 'api_url', label: 'URL da API', type: 'url', required: true },
              { name: 'api_key', label: 'Chave da API', type: 'password', required: true },
              { name: 'default_list_id', label: 'ID da Lista Padrão', type: 'text', required: false }
            ]
          },
          {
            id: 'make',
            name: 'Make (Integromat)',
            description: 'Automação de processos',
            logo_url: '/integrations/make-logo.png',
            fields: [
              { name: 'webhook_url', label: 'URL do Webhook', type: 'url', required: true },
              { name: 'api_token', label: 'Token da API', type: 'password', required: false }
            ]
          },
          {
            id: 'zapier',
            name: 'Zapier',
            description: 'Automação entre aplicativos',
            logo_url: '/integrations/zapier-logo.png',
            fields: [
              { name: 'webhook_url', label: 'URL do Webhook', type: 'url', required: true },
              { name: 'api_key', label: 'Chave da API', type: 'password', required: false }
            ]
          }
        ];
        resolve({ data: availableIntegrations, error: null });
      }, 500);
    });
  },

  // Integrações configuradas
  async getIntegrations() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockIntegrations, error: null });
      }, 600);
    });
  },

  async getIntegration(integrationId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const integration = mockIntegrations.find(i => i.id === integrationId);
        if (integration) {
          resolve({ data: integration, error: null });
        } else {
          resolve({ data: null, error: { message: 'Integração não encontrada' } });
        }
      }, 400);
    });
  },

  async createIntegration(integrationData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newIntegration = {
          id: 'integration-' + integrationData.name.toLowerCase().replace(/\s+/g, '-'),
          ...integrationData,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        resolve({ data: newIntegration, error: null });
      }, 1000);
    });
  },

  async updateIntegration(integrationId, updates) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const integration = mockIntegrations.find(i => i.id === integrationId);
        if (integration) {
          const updatedIntegration = {
            ...integration,
            ...updates,
            updated_at: new Date().toISOString()
          };
          resolve({ data: updatedIntegration, error: null });
        } else {
          resolve({ data: null, error: { message: 'Integração não encontrada' } });
        }
      }, 800);
    });
  },

  async deleteIntegration(integrationId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: null, error: null });
      }, 600);
    });
  },

  async toggleIntegration(integrationId, isActive) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const integration = mockIntegrations.find(i => i.id === integrationId);
        if (integration) {
          const updatedIntegration = {
            ...integration,
            is_active: isActive,
            updated_at: new Date().toISOString()
          };
          resolve({ data: updatedIntegration, error: null });
        } else {
          resolve({ data: null, error: { message: 'Integração não encontrada' } });
        }
      }, 500);
    });
  },

  // Testar integração
  async testIntegration(integrationId, testData = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const integration = mockIntegrations.find(i => i.id === integrationId);
        if (integration && integration.is_active) {
          resolve({ 
            data: { 
              success: true, 
              message: 'Integração testada com sucesso',
              response_time: Math.floor(Math.random() * 500) + 100
            }, 
            error: null 
          });
        } else {
          resolve({ 
            data: null, 
            error: { message: 'Integração não encontrada ou inativa' } 
          });
        }
      }, 2000);
    });
  },

  // Webhook e automações
  async sendWebhook(integrationId, eventType, payload) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const integration = mockIntegrations.find(i => i.id === integrationId);
        if (integration && integration.is_active) {
          const response = {
            id: Date.now().toString(),
            status: 'sent',
            response_code: 200,
            sent_at: new Date().toISOString()
          };
          resolve({ data: response, error: null });
        } else {
          resolve({ 
            data: null, 
            error: { message: 'Integração não encontrada ou inativa' } 
          });
        }
      }, 1000);
    });
  },

  async getWebhookLogs(integrationId, limit = 50) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const logs = mockWebhookLogs.filter(log => 
          !integrationId || log.integration_name.toLowerCase().includes(integrationId.replace('integration-', ''))
        );
        resolve({ data: logs, error: null });
      }, 600);
    });
  },

  // ActiveCampaign específico
  async addContactToActiveCampaign(contactData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const contact = {
          id: Date.now().toString(),
          email: contactData.email,
          firstName: contactData.firstName,
          lastName: contactData.lastName,
          phone: contactData.phone,
          tags: contactData.tags || [],
          lists: contactData.lists || ['1'],
          created_at: new Date().toISOString()
        };
        resolve({ data: contact, error: null });
      }, 1200);
    });
  },

  async getActiveCampaignLists() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lists = [
          { id: '1', name: 'Lista Principal', subscriber_count: 1250 },
          { id: '2', name: 'Prospects', subscriber_count: 850 },
          { id: '3', name: 'Clientes VIP', subscriber_count: 120 }
        ];
        resolve({ data: lists, error: null });
      }, 800);
    });
  },

  // Make/Zapier específico
  async triggerAutomation(integrationId, triggerData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = {
          trigger_id: Date.now().toString(),
          status: 'triggered',
          message: 'Automação disparada com sucesso',
          triggered_at: new Date().toISOString()
        };
        resolve({ data: result, error: null });
      }, 1500);
    });
  }
};