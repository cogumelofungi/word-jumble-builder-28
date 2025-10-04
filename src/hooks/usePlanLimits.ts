import { useUserPlan } from './useUserPlan';

interface PlanLimits {
  maxProducts: number;
  planName: string;
  isLoading: boolean;
}

export const usePlanLimits = (): PlanLimits => {
  const { planName, isLoading } = useUserPlan();
  
  // While loading, avoid showing default "Essencial" to prevent UI flash
  let maxProducts = isLoading ? 0 : 3; // Default to Essencial (produto principal + 2 bônus) after load
  
  if (!isLoading && planName) {
    switch (planName) {
      case 'Essencial':
        maxProducts = 3; // produto principal + 2 bônus
        break;
      case 'Profissional':
        maxProducts = 5; // produto principal + 4 bônus  
        break;
      case 'Empresarial':
        maxProducts = 10; // produto principal + 9 bônus
        break;
      default:
        maxProducts = 3;
        break;
    }
  }

  const displayedPlanName = isLoading ? '' : (planName || 'Essencial');

  return {
    maxProducts,
    planName: displayedPlanName,
    isLoading
  };
};