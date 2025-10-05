-- Criar função para deletar usuário completamente (dados + autenticação)
CREATE OR REPLACE FUNCTION public.admin_delete_user_complete(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete all apps created by the user
  DELETE FROM public.apps WHERE user_id = target_user_id;
  
  -- Delete all draft apps created by the user  
  DELETE FROM public.draft_apps WHERE user_id = target_user_id;
  
  -- Delete user status
  DELETE FROM public.user_status WHERE user_id = target_user_id;
  
  -- Delete user profile
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  -- Delete from auth.users (this will cascade delete related auth data)
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;