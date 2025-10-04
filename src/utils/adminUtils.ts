import { supabase } from '@/integrations/supabase/client';

/**
 * SECURITY: Admin role assignment through secure database function
 * Only existing admins can assign roles to other users
 */
export const assignAdminRole = async (targetUserId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('admin_assign_role', {
      target_user_id: targetUserId,
      role_name: 'admin'
    });

    if (error) {
      console.error('Error assigning admin role:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Error in assignAdminRole:', error);
    return false;
  }
};

/**
 * Check if current user can access admin functions
 */
export const canAccessAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: 'admin'
    });

    return data === true;
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
};