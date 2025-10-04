-- Fix search path security issue for admin functions
DROP FUNCTION IF EXISTS admin_delete_app(UUID);
DROP FUNCTION IF EXISTS admin_delete_user(UUID);

-- Recreate admin RPC function to delete apps with secure search path
CREATE OR REPLACE FUNCTION admin_delete_app(app_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Delete the app directly (admin function bypasses RLS)
  DELETE FROM public.apps WHERE id = app_id;
  
  -- Also delete from draft_apps if exists
  DELETE FROM public.draft_apps WHERE id = app_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate admin RPC function to delete users with secure search path
CREATE OR REPLACE FUNCTION admin_delete_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Delete all apps created by the user
  DELETE FROM public.apps WHERE user_id = admin_delete_user.user_id;
  
  -- Delete all draft apps created by the user  
  DELETE FROM public.draft_apps WHERE user_id = admin_delete_user.user_id;
  
  -- Delete user status
  DELETE FROM public.user_status WHERE user_id = admin_delete_user.user_id;
  
  -- Delete user profile
  DELETE FROM public.profiles WHERE id = admin_delete_user.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;