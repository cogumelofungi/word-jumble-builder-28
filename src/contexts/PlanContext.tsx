import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserPlanContextValue {
  hasPlan: boolean;
  hasActivePlan: boolean;
  planName: string | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const PlanContext = createContext<UserPlanContextValue>({
  hasPlan: false,
  hasActivePlan: false,
  planName: null,
  isLoading: true,
  refresh: async () => {},
});

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [hasPlan, setHasPlan] = useState(false);
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [planName, setPlanName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserPlan = useCallback(async () => {
    if (!user?.id) {
      setHasPlan(false);
      setHasActivePlan(false);
      setPlanName(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_status')
        .select(`
          plan_id,
          plans (
            name,
            price
          )
        `)
        .eq('user_id', user.id)
        .single();

      console.log('Raw data from user_status:', data);

      if (error) {
        console.error('Erro ao buscar plano do usuário (context):', error);
        setHasPlan(false);
        setHasActivePlan(false);
        setPlanName(null);
      } else {
        const hasValidPlan = data?.plan_id !== null && data?.plans !== null;
        const currentPlanName = data?.plans?.name || null;
        const isActive = hasValidPlan && currentPlanName !== 'Gratuito';

        console.log('Setting plan state (context):', {
          hasValidPlan,
          planName: currentPlanName,
          isActivePlan: isActive,
        });

        setHasPlan(hasValidPlan);
        setHasActivePlan(isActive);
        setPlanName(currentPlanName);
      }
    } catch (err) {
      console.error('Erro ao buscar plano do usuário (context):', err);
      setHasPlan(false);
      setHasActivePlan(false);
      setPlanName(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    // Always refresh when user id changes
    fetchUserPlan();
  }, [fetchUserPlan]);

  const value: UserPlanContextValue = {
    hasPlan,
    hasActivePlan,
    planName,
    isLoading,
    refresh: fetchUserPlan,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
};

export const usePlanContext = () => useContext(PlanContext);
