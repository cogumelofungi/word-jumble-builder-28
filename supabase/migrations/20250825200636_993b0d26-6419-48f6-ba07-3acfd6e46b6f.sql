-- Forçar remoção de todas as versões da função
DROP FUNCTION IF EXISTS get_public_app(text) CASCADE;

-- Criar função simples para buscar apps públicos
CREATE OR REPLACE FUNCTION get_public_app(app_slug TEXT)
RETURNS SETOF apps
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT * FROM apps
  WHERE slug = app_slug 
    AND status = 'publicado';
$$;