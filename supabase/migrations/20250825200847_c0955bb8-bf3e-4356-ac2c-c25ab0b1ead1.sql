-- Corrigir a função para definir search_path explicitamente
CREATE OR REPLACE FUNCTION get_public_app(app_slug TEXT)
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