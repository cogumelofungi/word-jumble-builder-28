import { useEffect, useState } from 'react';
import type { CustomTemplate } from '@/types/customTemplate';

const STORAGE_KEY = 'customTemplates';
const ACTIVE_KEY = 'activeCustomTemplateId';

export interface ActiveCustomTemplateInfo {
  template?: 'classic' | 'corporate' | 'showcase' | 'modern' | 'minimal';
  primaryColor?: string;
  full?: CustomTemplate;
}

export const useActiveCustomTemplate = (): ActiveCustomTemplateInfo => {
  const [active, setActive] = useState<ActiveCustomTemplateInfo>({});

  useEffect(() => {
    try {
      const activeId = localStorage.getItem(ACTIVE_KEY);
      const saved = localStorage.getItem(STORAGE_KEY);
      if (activeId && saved) {
        const list = JSON.parse(saved) as CustomTemplate[];
        const found = list.find(t => t.id === activeId);
        if (found) {
          setActive({
            template: found.template,
            primaryColor: found.colors?.primary,
            full: found
          });
          return;
        }
      }
    } catch {}
    setActive({});
  }, []);

  return active;
};
