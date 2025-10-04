import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';

interface RouteProtectionOptions {
  requireAuth?: boolean;
  requireEmailConfirmed?: boolean;
  redirectTo?: string;
  redirectToIfAuth?: string;
}

/**
 * Hook para proteção de rotas
 * Pronto para usar com Supabase Auth
 */
export const useRouteProtection = (options: RouteProtectionOptions = {}) => {
  const { 
    requireAuth = true, 
    requireEmailConfirmed = false,
    redirectTo = '/auth',
    redirectToIfAuth = '/app'
  } = options;
  
  const { user, isLoading, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    // Redirecionar usuários autenticados de páginas de auth
    if (isAuthenticated && !requireAuth) {
      navigate(redirectToIfAuth);
      return;
    }

    // Verificar se precisa de autenticação
    if (requireAuth && !isAuthenticated) {
      navigate(redirectTo);
      return;
    }

    // Verificar se email precisa estar confirmado
    if (requireEmailConfirmed && user && !user.email_confirmed_at) {
      navigate('/verify-email');
      return;
    }
  }, [
    isLoading, 
    isAuthenticated, 
    user, 
    requireAuth, 
    requireEmailConfirmed, 
    redirectTo, 
    redirectToIfAuth, 
    navigate
  ]);

  return {
    isLoading,
    isAuthenticated,
    isEmailConfirmed: user?.email_confirmed_at !== null,
    canAccess: isAuthenticated && (!requireEmailConfirmed || user?.email_confirmed_at !== null)
  };
};