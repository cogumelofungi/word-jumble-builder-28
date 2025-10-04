-- Fix function search path security warning
-- Set search_path for all functions to be immutable

-- Update the get_public_app function to have proper search_path
CREATE OR REPLACE FUNCTION public.get_public_app(app_slug text)
RETURNS TABLE(
  id uuid,
  slug text,
  nome text,
  descricao text,
  icone_url text,
  capa_url text,
  template text,
  theme_config jsonb,
  cor text,
  produto_principal_url text,
  bonus1_url text,
  bonus2_url text,
  bonus3_url text,
  bonus4_url text,
  bonus5_url text,
  bonus6_url text,
  bonus7_url text,
  main_product_label text,
  main_product_description text,
  bonuses_label text,
  bonus1_label text,
  bonus2_label text,
  bonus3_label text,
  bonus4_label text,
  bonus5_label text,
  bonus6_label text,
  bonus7_label text,
  allow_pdf_download boolean,
  link_personalizado text,
  created_at timestamptz
)
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = 'public'
AS $$
  SELECT 
    apps.id,
    apps.slug,
    apps.nome,
    apps.descricao,
    apps.icone_url,
    apps.capa_url,
    apps.template,
    apps.theme_config,
    apps.cor,
    apps.produto_principal_url,
    apps.bonus1_url,
    apps.bonus2_url,
    apps.bonus3_url,
    apps.bonus4_url,
    apps.bonus5_url,
    apps.bonus6_url,
    apps.bonus7_url,
    apps.main_product_label,
    apps.main_product_description,
    apps.bonuses_label,
    apps.bonus1_label,
    apps.bonus2_label,
    apps.bonus3_label,
    apps.bonus4_label,
    apps.bonus5_label,
    apps.bonus6_label,
    apps.bonus7_label,
    apps.allow_pdf_download,
    apps.link_personalizado,
    apps.created_at
  FROM public.apps
  WHERE apps.slug = app_slug 
    AND apps.status = 'publicado'
$$;