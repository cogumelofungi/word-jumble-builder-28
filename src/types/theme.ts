export interface ThemeConfig {
  template: 'classic' | 'corporate' | 'showcase' | 'modern' | 'minimal';
  colors: {
    primary: string;
    background: string;
    surface: string;
    accent: string;
    text: string;
    textSecondary: string;
  };
  layout: {
    headerStyle: 'full-cover' | 'top-nav' | 'centered' | 'minimal';
    contentLayout: 'single-column' | 'sidebar' | 'grid' | 'cards';
    buttonStyle: 'rounded' | 'square' | 'pill' | 'minimal';
    cardStyle: 'elevated' | 'flat' | 'outlined' | 'glassmorphism';
    spacing: 'compact' | 'normal' | 'spacious';
    typography: 'modern' | 'classic' | 'minimal' | 'bold';
  };
  effects: {
    animations: boolean;
    shadows: boolean;
    gradients: boolean;
    blur: boolean;
  };
}

export const THEME_PRESETS: Record<string, ThemeConfig> = {
  classic: {
    template: 'classic',
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
  },
  corporate: {
    template: 'corporate',
    colors: {
      primary: '#2563eb',
      background: '#0f172a',
      surface: '#1e293b',
      accent: '#3b82f6',
      text: '#f8fafc',
      textSecondary: '#94a3b8'
    },
    layout: {
      headerStyle: 'top-nav',
      contentLayout: 'sidebar',
      buttonStyle: 'square',
      cardStyle: 'flat',
      spacing: 'compact',
      typography: 'modern'
    },
    effects: {
      animations: false,
      shadows: false,
      gradients: false,
      blur: false
    }
  },
  showcase: {
    template: 'showcase',
    colors: {
      primary: '#8b5cf6',
      background: '#0f0f23',
      surface: '#1a1a2e',
      accent: '#a855f7',
      text: '#ffffff',
      textSecondary: '#c084fc'
    },
    layout: {
      headerStyle: 'full-cover',
      contentLayout: 'cards',
      buttonStyle: 'pill',
      cardStyle: 'glassmorphism',
      spacing: 'spacious',
      typography: 'bold'
    },
    effects: {
      animations: true,
      shadows: true,
      gradients: true,
      blur: true
    }
  },
  modern: {
    template: 'modern',
    colors: {
      primary: '#06b6d4',
      background: '#0f172a',
      surface: '#1e293b',
      accent: '#0891b2',
      text: '#f1f5f9',
      textSecondary: '#64748b'
    },
    layout: {
      headerStyle: 'top-nav',
      contentLayout: 'cards',
      buttonStyle: 'rounded',
      cardStyle: 'elevated',
      spacing: 'normal',
      typography: 'modern'
    },
    effects: {
      animations: true,
      shadows: true,
      gradients: true,
      blur: false
    }
  },
  minimal: {
    template: 'minimal',
    colors: {
      primary: '#64748b',
      background: '#0a0a0a',
      surface: '#1a1a1a',
      accent: '#475569',
      text: '#f8fafc',
      textSecondary: '#94a3b8'
    },
    layout: {
      headerStyle: 'minimal',
      contentLayout: 'single-column',
      buttonStyle: 'minimal',
      cardStyle: 'flat',
      spacing: 'spacious',
      typography: 'minimal'
    },
    effects: {
      animations: false,
      shadows: false,
      gradients: false,
      blur: true
    }
  }
};