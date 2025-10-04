// Hooks de autenticação organizados e prontos para Supabase
export { useAuth } from '../useAuth';
export { useAuthActions } from '../useAuthActions';
export { useAuthState } from '../useAuthState';
export { useRouteProtection } from '../useRouteProtection';
export { usePermissions } from '../usePermissions';

// Hooks específicos já existentes
export { useAdminAuth } from '../useAdminAuth';
export { useUserPlan } from '../useUserPlan';
export { useUserStatus } from '../useUserStatus';

// Contexto
export { AuthProvider, useAuthContext } from '../../contexts/AuthContext';

// Componentes
export { AuthGuard } from '../../components/auth/AuthGuard';