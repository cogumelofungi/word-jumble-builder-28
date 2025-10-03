-- Fix the ambiguous column reference in admin_delete_user function
DROP FUNCTION IF EXISTS admin_delete_user(UUID);

CREATE OR REPLACE FUNCTION admin_delete_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Delete all apps created by the user
  DELETE FROM public.apps WHERE user_id = target_user_id;
  
  -- Delete all draft apps created by the user  
  DELETE FROM public.draft_apps WHERE user_id = target_user_id;
  
  -- Delete user status
  DELETE FROM public.user_status WHERE user_id = target_user_id;
  
  -- Delete user profile
  DELETE FROM public.profiles WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;