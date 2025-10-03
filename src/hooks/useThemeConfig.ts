import { useState, useCallback } from 'react';
import { ThemeConfig, THEME_PRESETS } from '@/types/theme';

export const useThemeConfig = () => {
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(THEME_PRESETS.classic);

  const applyTheme = useCallback((template: keyof typeof THEME_PRESETS, primaryColor?: string) => {
    const preset = THEME_PRESETS[template];
    if (!preset) return;

    const newConfig = {
      ...preset,
      colors: {
        ...preset.colors,
        ...(primaryColor && { primary: primaryColor })
      }
    };

    setThemeConfig(newConfig);
    return newConfig;
  }, []);

  const updateThemeConfig = useCallback((updates: Partial<ThemeConfig>) => {
    setThemeConfig(prev => ({
      ...prev,
      ...updates,
      colors: { ...prev.colors, ...updates.colors },
      layout: { ...prev.layout, ...updates.layout },
      effects: { ...prev.effects, ...updates.effects }
    }));
  }, []);

  const generateThemeCSS = useCallback((config: ThemeConfig) => {
    return `
      :root {
        --theme-primary: ${config.colors.primary};
        --theme-background: ${config.colors.background};
        --theme-surface: ${config.colors.surface};
        --theme-accent: ${config.colors.accent};
        --theme-text: ${config.colors.text};
        --theme-text-secondary: ${config.colors.textSecondary};
        --theme-spacing: ${config.layout.spacing === 'compact' ? '0.5rem' : config.layout.spacing === 'spacious' ? '2rem' : '1rem'};
        --theme-border-radius: ${config.layout.buttonStyle === 'pill' ? '9999px' : config.layout.buttonStyle === 'square' ? '0.25rem' : '0.5rem'};
      }
      
      .theme-surface {
        background-color: var(--theme-surface);
        ${config.effects.shadows ? 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);' : ''}
        ${config.effects.blur ? 'backdrop-filter: blur(8px);' : ''}
      }
      
      .theme-card {
        background-color: var(--theme-surface);
        color: var(--theme-text);
        border-radius: ${config.layout.cardStyle === 'flat' ? '0' : 'var(--theme-border-radius)'};
        ${config.layout.cardStyle === 'elevated' && config.effects.shadows ? 'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);' : ''}
        ${config.layout.cardStyle === 'outlined' ? 'border: 1px solid rgba(255, 255, 255, 0.1);' : ''}
        ${config.layout.cardStyle === 'glassmorphism' ? 'background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);' : ''}
      }
      
      .theme-button {
        background-color: var(--theme-primary);
        color: white;
        border-radius: var(--theme-border-radius);
        ${config.effects.shadows ? 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);' : ''}
        ${config.effects.animations ? 'transition: all 0.2s ease-in-out;' : ''}
      }
      
      .theme-button:hover {
        ${config.effects.animations ? 'transform: translateY(-1px);' : ''}
        ${config.effects.shadows ? 'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);' : ''}
      }
      
      .theme-text {
        color: var(--theme-text);
        font-weight: ${config.layout.typography === 'bold' ? '700' : config.layout.typography === 'minimal' ? '300' : '400'};
      }
      
      .theme-text-secondary {
        color: var(--theme-text-secondary);
        font-weight: ${config.layout.typography === 'bold' ? '600' : config.layout.typography === 'minimal' ? '300' : '400'};
      }
    `;
  }, []);

  return {
    themeConfig,
    applyTheme,
    updateThemeConfig,
    generateThemeCSS
  };
};