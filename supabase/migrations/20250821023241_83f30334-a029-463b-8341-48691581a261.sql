-- Modificar a função handle_new_user para também criar o perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Buscar o ID do plano gratuito
  SELECT id INTO free_plan_id FROM plans WHERE name = 'Gratuito';
  
  -- Inserir status do usuário com plano gratuito
  INSERT INTO public.user_status (user_id, plan_id, is_active)
  VALUES (NEW.id, free_plan_id, true);
  
  -- Inserir perfil do usuário com dados do metadata
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name'),
    NEW.raw_user_meta_data->>'phone'
  );
  
  RETURN NEW;
END;
$$;