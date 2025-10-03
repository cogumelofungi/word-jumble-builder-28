import { useAuthContext } from '@/contexts/AuthContext';
import { useAuthActions } from './useAuthActions';

/**
 * Hook principal para autenticação - combina estado e ações
 * Pronto para usar com Supabase Auth
 */
export const useAuthState = () => {
  const authState = useAuthContext();
  const authActions = useAuthActions();

  return {
    // Estado
    ...authState,
    
    // Ações
    ...authActions,
    
    // Propriedades derivadas úteis
    userEmail: authState.user?.email || null,
    userId: authState.user?.id || null,
    userMetadata: authState.user?.user_metadata || {},
    
    // Verificações úteis
    isEmailConfirmed: authState.user?.email_confirmed_at !== null,
    hasUser: authState.user !== null,
  };
};