import { useState, useEffect } from 'react';
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
  const { user, isAuthenticated } = useAuth();

  const checkAdminStatus = async () => {
    console.log('🔍 checkAdminStatus called - isAuthenticated:', isAuthenticated, 'user:', user?.email);
    
    if (!isAuthenticated || !user) {
      console.log('❌ Not authenticated or no user');
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔄 Checking admin role for user:', user.id);
      
      // Check if user has admin role using the database function
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      console.log('📊 RPC has_role result - data:', data, 'error:', error);

      if (error) {
        console.error('❌ Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        console.log('✅ Admin status result:', data);
        setIsAdmin(data || false);
      }
    } catch (error) {
      console.error('❌ Exception checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
      console.log('✅ checkAdminStatus completed');
    }
  };

  useEffect(() => {
    console.log('🔄 useAdminAuth useEffect triggered - user changed:', user?.email, 'isAuthenticated:', isAuthenticated);
    checkAdminStatus();
  }, [user?.id, isAuthenticated]); // Only depend on user.id to avoid infinite loops

  const logout = async () => {
    setIsAdmin(false);
    setIsLoading(false);
    // The actual logout is handled by useAuth
  };

  return { 
    isAdmin, 
    isLoading, 
    checkAdminStatus, 
    logout 
  };
};