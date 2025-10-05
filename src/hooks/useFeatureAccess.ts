import { useUserPlan } from './useUserPlan';

interface FeatureAccess {
  hasCustomDomain: boolean;
  hasAppImport: boolean;
  hasPremiumTemplates: boolean;
  hasWhatsAppSupport: boolean;
  isLoading: boolean;
  planName: string | null;
}

export const useFeatureAccess = (): FeatureAccess => {
  const { planName, isLoading } = useUserPlan();

  // Definir as permissões por plano
  const features = {
    hasCustomDomain: planName === 'Profissional' || planName === 'Empresarial',
    hasAppImport: planName === 'Profissional' || planName === 'Empresarial',
    hasPremiumTemplates: planName === 'Empresarial',
    hasWhatsAppSupport: planName === 'Profissional' || planName === 'Empresarial',
  };

  return {
    ...features,
    isLoading,
    planName
  };
};

// Helper para obter o plano mínimo necessário para um recurso
export const getRequiredPlan = (feature: keyof Omit<FeatureAccess, 'isLoading' | 'planName'>): string => {
  const planRequirements = {
    hasCustomDomain: 'Plano Profissional',
    hasAppImport: 'Plano Profissional', 
    hasPremiumTemplates: 'Plano Empresarial',
    hasWhatsAppSupport: 'Plano Profissional',
  };

  return planRequirements[feature];
};