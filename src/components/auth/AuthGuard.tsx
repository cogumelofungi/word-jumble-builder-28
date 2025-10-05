import React, { ReactNode } from 'react';
import { useRouteProtection } from '@/hooks/useRouteProtection';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireEmailConfirmed?: boolean;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * Componente para proteção de conteúdo baseado em autenticação e permissões
 * Pronto para usar com Supabase Auth
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requireEmailConfirmed = false,
  requiredRoles = [],
  requiredPermissions = [],
  fallback = null,
  redirectTo
}) => {
  const { isLoading: authLoading, canAccess } = useRouteProtection({
    requireAuth,
    requireEmailConfirmed,
    redirectTo
  });

  const { 
    isLoading: permissionsLoading, 
    hasAnyRole, 
    hasAnyPermission 
  } = usePermissions();

  const isLoading = authLoading || permissionsLoading;

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Verificar acesso básico (autenticação)
  if (!canAccess) {
    return fallback ? <>{fallback}</> : null;
  }

  // Verificar roles se especificadas
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return fallback ? <>{fallback}</> : (
      <div className="text-center p-8">
        <p className="text-app-muted">Você não tem permissão para acessar este conteúdo.</p>
      </div>
    );
  }

  // Verificar permissões se especificadas
  if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
    return fallback ? <>{fallback}</> : (
      <div className="text-center p-8">
        <p className="text-app-muted">Você não tem permissão para acessar este conteúdo.</p>
      </div>
    );
  }

  return <>{children}</>;
};