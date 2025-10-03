// Mock data para appService - formato Supabase
const mockApps = [
  {
    id: '1',
    user_id: '1',
    nome: 'Meu App Exemplo',
    slug: 'meu-app-exemplo',
    descricao: 'Descrição do meu app',
    cor: '#3B82F6',
    status: 'publicado',
    capa_url: 'https://example.com/capa.jpg',
    icone_url: 'https://example.com/icone.jpg',
    produto_principal_url: 'https://example.com/produto',
    main_product_label: 'Produto Principal',
    bonuses_label: 'Bônus Extras',
    bonus1_label: 'Bônus 1',
    bonus1_url: 'https://example.com/bonus1',
    bonus2_label: 'Bônus 2',
    bonus2_url: 'https://example.com/bonus2',
    link_personalizado: 'https://meudominio.com',
    allow_pdf_download: true,
    views: 150,
    downloads: 25,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockDraftApp = {
  id: '1',
  user_id: '1',
  nome: 'Rascunho do App',
  cor: '#10B981',
  descricao: 'App em desenvolvimento',
  capa_url: null,
  icone_url: null,
  produto_principal_url: null,
  main_product_label: null,
  bonuses_label: null,
  link_personalizado: null,
  allow_pdf_download: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

export const appService = {
  // Apps publicados
  async getApps(userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userApps = mockApps.filter(app => app.user_id === userId);
        resolve({ data: userApps, error: null });
      }, 800);
    });
  },

  async getAppBySlug(slug) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const app = mockApps.find(app => app.slug === slug);
        if (app) {
          resolve({ data: app, error: null });
        } else {
          resolve({ data: null, error: { message: 'App não encontrado' } });
        }
      }, 600);
    });
  },

  async createApp(appData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newApp = {
          id: Date.now().toString(),
          ...appData,
          status: 'publicado',
          views: 0,
          downloads: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        resolve({ data: newApp, error: null });
      }, 1200);
    });
  },

  async updateApp(appId, updates) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedApp = { ...mockApps[0], ...updates, updated_at: new Date().toISOString() };
        resolve({ data: updatedApp, error: null });
      }, 1000);
    });
  },

  async deleteApp(appId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: null, error: null });
      }, 800);
    });
  },

  // Rascunhos
  async getDraftApp(userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockDraftApp, error: null });
      }, 600);
    });
  },

  async saveDraftApp(userId, draftData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedDraft = { ...mockDraftApp, ...draftData, updated_at: new Date().toISOString() };
        resolve({ data: updatedDraft, error: null });
      }, 800);
    });
  },

  async publishDraftApp(userId, slug) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const publishedApp = {
          ...mockDraftApp,
          slug,
          status: 'publicado',
          views: 0,
          downloads: 0,
          updated_at: new Date().toISOString()
        };
        resolve({ data: publishedApp, error: null });
      }, 1500);
    });
  },

  // Estatísticas
  async incrementViews(slug) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: null, error: null });
      }, 300);
    });
  },

  async incrementDownloads(slug) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: null, error: null });
      }, 300);
    });
  },

  async getAppStats(appId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stats = {
          views: 150,
          downloads: 25,
          last_30_days_views: 45,
          last_30_days_downloads: 8
        };
        resolve({ data: stats, error: null });
      }, 500);
    });
  }
};