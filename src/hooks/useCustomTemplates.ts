import { useState, useCallback, useEffect } from 'react';
import { CustomTemplate, DEFAULT_CUSTOM_TEMPLATE } from '@/types/customTemplate';
import { toast } from 'sonner';

const STORAGE_KEY = 'customTemplates';
const ACTIVE_KEY = 'activeCustomTemplateId';

export const useCustomTemplates = () => {
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as CustomTemplate[]) : [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // Persist to localStorage whenever templates change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customTemplates));
    } catch {}
  }, [customTemplates]);

  const createTemplate = useCallback(async (templateData: Partial<CustomTemplate>) => {
    setIsLoading(true);
    try {
      const newTemplate: CustomTemplate = {
        ...DEFAULT_CUSTOM_TEMPLATE,
        ...templateData,
        id: `custom-${Date.now()}`,
        isPremium: true, // Todos templates personalizados são premium
        isActive: false,
        isPublished: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        tags: templateData.tags || [],
        category: templateData.category || 'custom'
      } as CustomTemplate;

      setCustomTemplates(prev => {
        const next = [...prev, newTemplate];
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
      toast.success('Template criado com sucesso!');
      return newTemplate;
    } catch (error) {
      toast.error('Erro ao criar template');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTemplate = useCallback(async (templateId: string, updates: Partial<CustomTemplate>) => {
    setIsLoading(true);
    try {
      setCustomTemplates(prev => {
        const next = prev.map(template => 
          template.id === templateId 
            ? { 
                ...template, 
                ...updates, 
                updatedAt: new Date().toISOString(),
                version: incrementVersion(template.version)
              } 
            : template
        );
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
      toast.success('Template atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar template');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTemplate = useCallback(async (templateId: string) => {
    setIsLoading(true);
    try {
      setCustomTemplates(prev => {
        const next = prev.filter(template => template.id !== templateId);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
        // Se o ativo foi deletado, limpar
        const activeId = localStorage.getItem(ACTIVE_KEY);
        if (activeId === templateId) {
          localStorage.removeItem(ACTIVE_KEY);
        }
        return next;
      });
      toast.success('Template excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir template');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const activateTemplate = useCallback(async (templateId: string) => {
    setIsLoading(true);
    try {
      setCustomTemplates(prev => {
        const next = prev.map(template => ({
          ...template,
          isActive: template.id === templateId
        }));
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          localStorage.setItem(ACTIVE_KEY, templateId);
        } catch {}
        return next;
      });
      toast.success('Template ativado no preview!');
    } catch (error) {
      toast.error('Erro ao ativar template');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const publishTemplate = useCallback(async (templateId: string, publish: boolean = true) => {
    setIsLoading(true);
    try {
      setCustomTemplates(prev => {
        const next = prev.map(template => 
          template.id === templateId 
            ? { ...template, isPublished: publish } 
            : template
        );
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
      toast.success(`Template ${publish ? 'publicado' : 'despublicado'} com sucesso!`);
    } catch (error) {
      toast.error('Erro ao publicar template');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const duplicateTemplate = useCallback(async (templateId: string) => {
    setIsLoading(true);
    try {
      const template = customTemplates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('Template não encontrado');
      }

      const duplicatedTemplate: CustomTemplate = {
        ...template,
        id: `custom-${Date.now()}`,
        name: `${template.name} (Cópia)`,
        isActive: false,
        isPublished: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0'
      };

      setCustomTemplates(prev => {
        const next = [...prev, duplicatedTemplate];
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
      toast.success('Template duplicado com sucesso!');
      return duplicatedTemplate;
    } catch (error) {
      toast.error('Erro ao duplicar template');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [customTemplates]);

  const getTemplatesByCategory = useCallback((category?: string) => {
    if (!category) return customTemplates;
    return customTemplates.filter(template => template.category === category);
  }, [customTemplates]);

  const getActiveTemplate = useCallback(() => {
    // Primeiro tenta via estado; se não houver, tenta localStorage
    const active = customTemplates.find(template => template.isActive) || null;
    if (active) return active;
    try {
      const activeId = localStorage.getItem(ACTIVE_KEY);
      const saved = localStorage.getItem(STORAGE_KEY);
      if (activeId && saved) {
        const list = JSON.parse(saved) as CustomTemplate[];
        return list.find(t => t.id === activeId) || null;
      }
    } catch {}
    return null;
  }, [customTemplates]);

  const getPublishedTemplates = useCallback(() => {
    return customTemplates.filter(template => template.isPublished);
  }, [customTemplates]);

  return {
    customTemplates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    activateTemplate,
    publishTemplate,
    duplicateTemplate,
    getTemplatesByCategory,
    getActiveTemplate,
    getPublishedTemplates
  };
};

// Helper function to increment version
function incrementVersion(version: string): string {
  const parts = version.split('.');
  const patch = parseInt(parts[2] || '0') + 1;
  return `${parts[0]}.${parts[1]}.${patch}`;
}
