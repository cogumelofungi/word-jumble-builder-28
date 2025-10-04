-- Corrigir problemas de segurança das funções

-- Recriar função update_updated_at_column com search_path seguro
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$;

-- Recriar função generate_unique_slug com search_path seguro
CREATE OR REPLACE FUNCTION public.generate_unique_slug(base_slug TEXT, app_name TEXT)
RETURNS TEXT 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  final_slug TEXT;
  counter INTEGER := 0;
  slug_candidate TEXT;
BEGIN
  -- Se não foi fornecido slug personalizado, gerar baseado no nome
  IF base_slug IS NULL OR base_slug = '' THEN
    base_slug := lower(regexp_replace(app_name, '[^a-zA-Z0-9]', '-', 'g'));
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
  END IF;
  
  slug_candidate := base_slug;
  
  -- Verificar se slug existe e incrementar se necessário
  WHILE EXISTS (SELECT 1 FROM public.apps WHERE slug = slug_candidate) LOOP
    counter := counter + 1;
    slug_candidate := base_slug || '-' || counter::text;
  END LOOP;
  
  RETURN slug_candidate;
END;
$$;