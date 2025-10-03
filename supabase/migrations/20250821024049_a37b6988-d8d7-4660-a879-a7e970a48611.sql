-- Criar função para usuário excluir sua própria conta
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Obter o ID do usuário atual
  current_user_id := auth.uid();
  
  -- Verificar se o usuário está autenticado
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Deletar todos os dados relacionados ao usuário
  DELETE FROM public.apps WHERE user_id = current_user_id;
  DELETE FROM public.user_roles WHERE user_id = current_user_id;
  DELETE FROM public.user_status WHERE user_id = current_user_id;
  DELETE FROM public.profiles WHERE id = current_user_id;
  
  RETURN true;
END;
$$;