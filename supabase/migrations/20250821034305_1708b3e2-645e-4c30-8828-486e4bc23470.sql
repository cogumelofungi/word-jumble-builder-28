-- Add missing columns to apps table to support new features
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS allow_pdf_download boolean DEFAULT true;
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS template text DEFAULT 'classic';
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS main_product_label text DEFAULT 'PRODUTO PRINCIPAL';
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS main_product_description text DEFAULT 'Disponível para download';
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS bonuses_label text DEFAULT 'BÔNUS EXCLUSIVOS';
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS bonus1_label text DEFAULT 'Bônus 1';
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS bonus2_label text DEFAULT 'Bônus 2';
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS bonus3_label text DEFAULT 'Bônus 3';
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS bonus4_label text DEFAULT 'Bônus 4';
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS bonus5_label text DEFAULT 'Bônus 5';
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS bonus6_label text DEFAULT 'Bônus 6';
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS bonus7_label text DEFAULT 'Bônus 7';

-- Add description column if it doesn't exist
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS descricao text;