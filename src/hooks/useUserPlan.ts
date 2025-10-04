import { usePlanContext } from '@/contexts/PlanContext';

interface UserPlan {
  hasPlan: boolean;
  hasActivePlan: boolean; // Plano pago (não gratuito)
  planName: string | null;
  isLoading: boolean;
}

export const useUserPlan = (): UserPlan => {
  // Use shared context to avoid duplicate fetches and UI flicker
  const { hasPlan, hasActivePlan, planName, isLoading } = usePlanContext();

  return {
    hasPlan,
    hasActivePlan,
    planName,
    isLoading,
  };
};
