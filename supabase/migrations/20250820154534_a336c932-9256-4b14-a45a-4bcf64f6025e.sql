-- Garantir que o usuário admin tenha a role correta
-- Primeiro, encontrar o ID do usuário admin
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Buscar o ID do usuário admin pelo email
  SELECT id INTO admin_user_id 
  FROM public.profiles 
  WHERE email = 'matheus.suporteplr@gmail.com';
  
  -- Se encontrou o usuário, garantir que tenha role de admin
  IF admin_user_id IS NOT NULL THEN
    -- Inserir role de admin se não existir
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Admin role garantida para o usuário %', admin_user_id;
  ELSE
    RAISE NOTICE 'Usuário admin não encontrado';
  END IF;
END $$;