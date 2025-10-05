-- Remover função com todas as assinaturas possíveis
DROP FUNCTION IF EXISTS get_public_app(text) CASCADE;
DROP FUNCTION IF EXISTS get_public_app CASCADE;

-- Recriar função com nome diferente para evitar conflitos
CREATE OR REPLACE FUNCTION fetch_public_app(app_slug TEXT)
RETURNS SETOF apps
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT * FROM apps
  WHERE slug = app_slug 
    AND status = 'publicado';
$$;