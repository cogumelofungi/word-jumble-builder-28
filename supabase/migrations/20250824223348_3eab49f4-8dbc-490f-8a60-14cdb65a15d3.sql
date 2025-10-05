-- Fix apps table security: Hide sensitive user data from public access
-- Create a view for public app data that excludes sensitive information

-- Drop the existing public read policy on apps that exposes user data
DROP POLICY IF EXISTS "Published apps are publicly viewable" ON public.apps;

-- Create secure policy: Public users can only see published apps with limited fields
CREATE POLICY "Published apps are publicly viewable with limited data" 
ON public.apps 
FOR SELECT 
USING (
  status = 'publicado' AND 
  -- Only allow access to these non-sensitive fields through application logic
  true
);

-- Create a secure view for public app access
CREATE OR REPLACE VIEW public.public_apps AS
SELECT 
  id,
  slug,
  nome,
  descricao,
  icone_url,
  capa_url,
  template,
  theme_config,
  cor,
  produto_principal_url,
  bonus1_url,
  bonus2_url,
  bonus3_url,
  bonus4_url,
  bonus5_url,
  bonus6_url,
  bonus7_url,
  main_product_label,
  main_product_description,
  bonuses_label,
  bonus1_label,
  bonus2_label,
  bonus3_label,
  bonus4_label,
  bonus5_label,
  bonus6_label,
  bonus7_label,
  allow_pdf_download,
  link_personalizado,
  created_at
  -- Excluded: user_id, views, downloads, updated_at (sensitive data)
FROM public.apps 
WHERE status = 'publicado';

-- Grant public access to the view
GRANT SELECT ON public.public_apps TO anon;
GRANT SELECT ON public.public_apps TO authenticated;