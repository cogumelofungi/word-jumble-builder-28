-- Fix security warnings by setting search_path for all functions

-- Update has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

-- Update admin_delete_user_complete function
CREATE OR REPLACE FUNCTION public.admin_delete_user_complete(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- Verificar se o usuário é admin
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Deletar todos os dados relacionados ao usuário
  DELETE FROM public.apps WHERE user_id = target_user_id;
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  DELETE FROM public.user_status WHERE user_id = target_user_id;
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  RETURN true;
END;
$$;

-- Update admin_delete_app function
CREATE OR REPLACE FUNCTION public.admin_delete_app(app_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- Verificar se o usuário é admin
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Deletar o app
  DELETE FROM public.apps WHERE id = app_id;
  
  RETURN true;
END;
$$;

-- Update generate_unique_slug function
CREATE OR REPLACE FUNCTION public.generate_unique_slug(base_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  slug_candidate text;
  slug_exists boolean;
  counter integer := 0;
BEGIN
  -- Criar slug base removendo caracteres especiais e convertendo para minúsculo
  slug_candidate := lower(regexp_replace(base_name, '[^a-zA-Z0-9]', '-', 'g'));
  slug_candidate := regexp_replace(slug_candidate, '-+', '-', 'g');
  slug_candidate := trim(both '-' from slug_candidate);
  
  -- Se o slug está vazio, usar um padrão
  IF slug_candidate = '' THEN
    slug_candidate := 'app';
  END IF;
  
  -- Verificar se o slug já existe
  SELECT EXISTS (
    SELECT 1 FROM apps WHERE slug = slug_candidate
  ) INTO slug_exists;
  
  -- Se existe, adicionar um número incrementalmente
  WHILE slug_exists LOOP
    counter := counter + 1;
    slug_candidate := lower(regexp_replace(base_name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || counter::text;
    slug_candidate := regexp_replace(slug_candidate, '-+', '-', 'g');
    slug_candidate := trim(both '-' from slug_candidate);
    
    SELECT EXISTS (
      SELECT 1 FROM apps WHERE slug = slug_candidate
    ) INTO slug_exists;
  END LOOP;
  
  RETURN slug_candidate;
END;
$$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Inserir user_status sem plano (plan_id = null) para novos usuários
  INSERT INTO public.user_status (user_id, is_active, plan_id)
  VALUES (NEW.id, true, null);
  
  -- Criar profile para o novo usuário
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  RETURN NEW;
END;
$$;