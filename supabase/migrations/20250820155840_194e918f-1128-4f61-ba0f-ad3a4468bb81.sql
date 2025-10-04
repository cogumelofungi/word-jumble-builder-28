-- Inserir o usuário que existe no auth mas não em profiles
-- Este usuário aparece nos logs de autenticação
INSERT INTO public.profiles (id, email, created_at, updated_at)
VALUES (
  '41843673-aeae-450f-a7d6-5b4ce0eeccd1',
  'disoca8615@mardiek.com',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Inserir user_status para esse usuário
INSERT INTO public.user_status (user_id, is_active, plan_id, created_at, updated_at)
VALUES (
  '41843673-aeae-450f-a7d6-5b4ce0eeccd1',
  true,
  null,
  now(),
  now()
) ON CONFLICT (user_id) DO NOTHING;

-- Recriar o trigger para garantir que funcione corretamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Inserir profile para o novo usuário
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NEW.created_at, NEW.updated_at)
  ON CONFLICT (id) DO NOTHING;
  
  -- Inserir user_status para o novo usuário
  INSERT INTO public.user_status (user_id, is_active, plan_id, created_at, updated_at)
  VALUES (NEW.id, true, null, NEW.created_at, NEW.updated_at)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();