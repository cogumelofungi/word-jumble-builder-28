import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionHistory {
  hasEverSubscribed: boolean;
  isLoading: boolean;
}

export const useSubscriptionHistory = (): SubscriptionHistory => {
  const [hasEverSubscribed, setHasEverSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSubscriptionHistory();
  }, []);

  const checkSubscriptionHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Verificar se existe histórico de assinatura no Stripe via edge function
      const { data, error } = await supabase.functions.invoke('check-subscription-history');
      
      if (error) {
        console.error('Erro ao verificar histórico de assinatura:', error);
        setHasEverSubscribed(false);
      } else {
        setHasEverSubscribed(data?.hasEverSubscribed || false);
      }
    } catch (error) {
      console.error('Erro ao verificar histórico de assinatura:', error);
      setHasEverSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    hasEverSubscribed,
    isLoading
  };
};