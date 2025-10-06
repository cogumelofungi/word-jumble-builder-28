import { useState, useEffect, useRef } from 'react';
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
      // Keep loading while auth is initializing to avoid premature redirects
      setIsLoading(authLoading ? true : false);
      hasChecked.current = authLoading ? false : true;
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
    // Wait for auth to finish loading
    if (authLoading) return;
    
    // Reset state if user changed
    if (user?.id !== lastUserId.current) {
      lastUserId.current = user.id;
    }
    
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
