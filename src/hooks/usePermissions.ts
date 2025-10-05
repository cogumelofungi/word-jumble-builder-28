import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

interface PermissionsState {
  isAdmin: boolean;
  roles: string[];
  permissions: string[];
  isLoading: boolean;
}

interface UserPermissions extends PermissionsState {
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

/**
 * Hook para gerenciar permissões e roles do usuário
 * Pronto para usar com Supabase Auth e RLS
 */
export const usePermissions = (): UserPermissions => {
  const { user, isAuthenticated } = useAuthContext();
  const [permissionsState, setPermissionsState] = useState<PermissionsState>({
    isAdmin: false,
    roles: [],
    permissions: [],
    isLoading: true
  });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setPermissionsState({
        isAdmin: false,
        roles: [],
        permissions: [],
        isLoading: false
      });
      return;
    }

    fetchUserPermissions();
  }, [user, isAuthenticated]);

  const fetchUserPermissions = async () => {
    if (!user) return;

    try {
      // Verificar se o usuário tem role de admin
      const { data: adminCheck, error: adminError } = await supabase
        .rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

      if (adminError) {
        console.error('Erro ao verificar role de admin:', adminError);
      }

      // Buscar todas as roles do usuário (quando implementado)
      // const { data: userRoles } = await supabase
      //   .from('user_roles')
      //   .select('role')
      //   .eq('user_id', user.id);

      // Buscar permissões específicas do usuário (quando implementado)
      // const { data: userPermissions } = await supabase
      //   .from('user_permissions')
      //   .select('permission')
      //   .eq('user_id', user.id);

      setPermissionsState({
        isAdmin: adminCheck || false,
        roles: [], // userRoles?.map(r => r.role) || [],
        permissions: [], // userPermissions?.map(p => p.permission) || [],
        isLoading: false
      });
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      setPermissionsState({
        isAdmin: false,
        roles: [],
        permissions: [],
        isLoading: false
      });
    }
  };

  const hasRole = (role: string): boolean => {
    return permissionsState.roles.includes(role) || permissionsState.isAdmin;
  };

  const hasPermission = (permission: string): boolean => {
    return permissionsState.permissions.includes(permission) || permissionsState.isAdmin;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const hasAnyPermission = (perms: string[]): boolean => {
    return perms.some(permission => hasPermission(permission));
  };

  return {
    ...permissionsState,
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAnyPermission
  };
};