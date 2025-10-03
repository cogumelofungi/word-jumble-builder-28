-- Criar função para buscar dados completos dos usuários incluindo display_name dos metadados
CREATE OR REPLACE FUNCTION public.get_users_with_metadata()
RETURNS TABLE (
  id uuid,
  email text,
  phone text,
  display_name text,
  created_at timestamptz,
  updated_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se o usuário é admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Retornar dados dos usuários com display_name dos metadados
  RETURN QUERY
  SELECT 
    au.id,
    au.email::text,
    p.phone,
    COALESCE(au.raw_user_meta_data->>'display_name', au.raw_user_meta_data->>'full_name', au.email::text) as display_name,
    au.created_at,
    au.updated_at
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.id = au.id
  ORDER BY au.created_at DESC;
END;
$$;