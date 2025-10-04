-- Criar função para lidar com novos usuários (sem plano por padrão)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir user_status sem plano (plan_id = null) para novos usuários
  INSERT INTO public.user_status (user_id, is_active, plan_id)
  VALUES (NEW.id, true, null);
  
  RETURN NEW;
END;
$$;

-- Criar trigger para executar a função quando um usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();