// Mock data para userService - formato Supabase
// Credenciais de teste: admin@teste.com / 123456
const mockUsers = [
  {
    id: '1',
    email: 'admin@teste.com',
    full_name: 'Usuário Teste',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockUserStatus = {
  id: '1',
  user_id: '1',
  is_active: true,
  phone: '+5511999999999',
  plan_id: 'plan-1',
  last_renewal_date: '2024-01-01',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  user: mockUsers[0]
};

export const userService = {
  // Autenticação principal - compatível com Supabase Auth
  async login(email, password) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === 'admin@teste.com' && password === '123456') {
          // Simula criação de sessão
          localStorage.setItem('mockUserSession', JSON.stringify(mockSession));
          resolve({ data: { session: mockSession, user: mockUsers[0] }, error: null });
        } else {
          resolve({ data: null, error: { message: 'Credenciais inválidas' } });
        }
      }, 1000);
    });
  },

  async logout() {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Remove sessão do localStorage
        localStorage.removeItem('mockUserSession');
        resolve({ error: null });
      }, 500);
    });
  },

  async getCurrentUser() {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simula verificação de token/sessão
        const hasValidSession = localStorage.getItem('mockUserSession');
        if (hasValidSession) {
          resolve({ data: { user: mockUsers[0] }, error: null });
        } else {
          resolve({ data: { user: null }, error: null });
        }
      }, 300);
    });
  },

  // Manter compatibilidade com nomes antigos
  async signIn(email, password) {
    return this.login(email, password);
  },

  async signUp(email, password, userData = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          id: Date.now().toString(),
          email,
          full_name: userData.full_name || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        resolve({ data: { user: newUser, session: null }, error: null });
      }, 1000);
    });
  },

  async signOut() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ error: null });
      }, 500);
    });
  },

  async getUser() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { user: mockUsers[0] }, error: null });
      }, 500);
    });
  },

  async updateUser(userId, updates) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedUser = { ...mockUsers[0], ...updates, updated_at: new Date().toISOString() };
        resolve({ data: updatedUser, error: null });
      }, 800);
    });
  },

  // Status do usuário
  async getUserStatus(userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockUserStatus, error: null });
      }, 500);
    });
  },

  async updateUserStatus(userId, statusData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedStatus = { ...mockUserStatus, ...statusData, updated_at: new Date().toISOString() };
        resolve({ data: updatedStatus, error: null });
      }, 800);
    });
  },

  // Perfil
  async getProfile(userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockUsers[0], error: null });
      }, 500);
    });
  },

  async updateProfile(userId, profileData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedProfile = { ...mockUsers[0], ...profileData, updated_at: new Date().toISOString() };
        resolve({ data: updatedProfile, error: null });
      }, 800);
    });
  }
};