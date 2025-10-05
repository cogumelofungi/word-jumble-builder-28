-- Adicionar primeiro usuário admin
-- IMPORTANTE: Substitua 'd0e00675-671c-4c46-9e6c-0dce912b1c8a' pelo ID que você copiou no Passo

INSERT INTO public.user_roles (user_id, role) 
VALUES ('d0e00675-671c-4c46-9e6c-0dce912b1c8a', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;

-- Criar função auxiliar para adicionar admins (uso futuro)
CREATE OR REPLACE FUNCTION public.admin_assign_role(
  target_user_id UUID,
  role_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se quem está chamando é admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Apenas admins podem atribuir roles';
  END IF;
  
  -- Inserir a role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, role_name::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN TRUE;
END;
$$;
