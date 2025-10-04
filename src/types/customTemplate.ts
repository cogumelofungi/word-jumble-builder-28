import { ThemeConfig } from './theme';

export interface CustomTemplate extends ThemeConfig {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  previewImage?: string;
  category: 'business' | 'creative' | 'minimal' | 'premium' | 'custom';
  tags: string[];
  author?: string;
  version: string;
}

export interface TemplateManager {
  templates: CustomTemplate[];
  activeTemplate: string | null;
  publishedTemplates: string[];
}

export const DEFAULT_CUSTOM_TEMPLATE: Partial<CustomTemplate> = {
  name: '',
  description: '',
  template: 'classic',
  isPremium: true,
  category: 'custom',
  tags: [],
  version: '1.0.0',
  colors: {
    primary: '#4783F6',
    background: '#1a1a1a',
    surface: '#2d2d2d',
    accent: '#6366f1',
    text: '#ffffff',
    textSecondary: '#b3b3b3'
  },
  layout: {
    headerStyle: 'full-cover',
    contentLayout: 'single-column',
    buttonStyle: 'rounded',
    cardStyle: 'elevated',
    spacing: 'normal',
    typography: 'classic'
  },
  effects: {
    animations: true,
    shadows: true,
    gradients: true,
    blur: false
  }
};

export type TemplateCategory = 'business' | 'creative' | 'minimal' | 'premium' | 'custom';

export const TEMPLATE_CATEGORIES: Record<TemplateCategory, { label: string; description: string; icon: string }> = {
  business: {
    label: 'Negócios',
    description: 'Templates profissionais para empresas',
    icon: '💼'
  },
  creative: {
    label: 'Criativo',
    description: 'Designs únicos e inovadores',
    icon: '🎨'
  },
  minimal: {
    label: 'Minimalista',
    description: 'Foco na simplicidade e clareza',
    icon: '⚪'
  },
  premium: {
    label: 'Premium',
    description: 'Templates exclusivos com recursos avançados',
    icon: '👑'
  },
  custom: {
    label: 'Personalizado',
    description: 'Templates criados por você',
    icon: '🛠️'
  }
};