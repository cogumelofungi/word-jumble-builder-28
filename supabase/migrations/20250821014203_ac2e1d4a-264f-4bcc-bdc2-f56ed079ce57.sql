-- Função para criar status de usuário com plano gratuito
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Buscar o ID do plano gratuito
  SELECT id INTO free_plan_id FROM plans WHERE name = 'Gratuito';
  
  -- Inserir status do usuário com plano gratuito
  INSERT INTO public.user_status (user_id, plan_id, is_active)
  VALUES (NEW.id, free_plan_id, true);
  
  RETURN NEW;
END;
$$;

-- Criar trigger para executar a função quando um novo usuário for criado
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();