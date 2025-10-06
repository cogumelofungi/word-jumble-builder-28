import { useState, useEffect } from 'react';  // ← Remover useRef
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AdminAuth {
  isAdmin: boolean;
  isLoading: boolean;
  checkAdminStatus: () => Promise<void>;
  logout: () => void;
}

export const useAdminAuth = (): AdminAuth => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const checkAdminStatus = async () => {
    if (!isAuthenticated || !user) {
      setIsAdmin(false);
      setIsLoading(authLoading ? true : false);
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (error) {
        console.error('❌ Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data || false);
      }
    } catch (error) {
      console.error('❌ Exception checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    checkAdminStatus();
  }, [user?.id, isAuthenticated, authLoading]);

  const logout = async () => {
    setIsAdmin(false);
    setIsLoading(false);
  };

  return { 
    isAdmin, 
    isLoading, 
    checkAdminStatus, 
    logout 
  };
};
