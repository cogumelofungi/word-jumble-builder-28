import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Map Stripe product IDs to plan names
const PRODUCT_TO_PLAN_MAP: Record<string, string> = {
  // Produtos mensais
  "prod_T53hZMY5YazqA2": "Essencial",
  "prod_T53ixEa3tGZqv7": "Profissional", 
  "prod_T53imrPITeC3xb": "Empresarial",
  // Produtos anuais
  "prod_T5Og881LqMVtsi": "Essencial",
  "prod_T5OhcLItHWJR7r": "Profissional",
  "prod_T5OhFwLIPzYWLN": "Empresarial",
};

interface SubscriptionStatus {
  subscribed: boolean;
  planName: string;
  subscription_end: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useStripeSubscription = () => {
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    planName: 'Gratuito',
    subscription_end: null,
    isLoading: true,
    error: null,
  });
  const { user } = useAuth();

  const checkSubscription = async () => {
    if (!user) {
      setStatus(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        throw new Error(error.message);
      }

      const planName = data.product_id ? PRODUCT_TO_PLAN_MAP[data.product_id] || 'Gratuito' : 'Gratuito';
      
      setStatus({
        subscribed: data.subscribed || false,
        planName,
        subscription_end: data.subscription_end || null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  };

  const openCustomerPortal = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user]);

  // Auto-refresh subscription status every minute
  useEffect(() => {
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user]);

  return {
    ...status,
    refresh: checkSubscription,
    openCustomerPortal,
  };
};