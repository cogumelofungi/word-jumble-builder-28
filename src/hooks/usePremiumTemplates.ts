import { useUserPlan } from './useUserPlan';

interface PremiumTemplateAccess {
  hasPremiumAccess: boolean;
  isLoading: boolean;
}

export const usePremiumTemplates = (): PremiumTemplateAccess => {
  const { planName, isLoading } = useUserPlan();

  const hasPremiumAccess = planName === 'Empresarial';

  return {
    hasPremiumAccess,
    isLoading
  };
};