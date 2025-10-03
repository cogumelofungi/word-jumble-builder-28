-- Adicionar campos para textos personalizáveis e descrição nas tabelas draft_apps e apps

-- Adicionar campos na tabela draft_apps
ALTER TABLE public.draft_apps 
ADD COLUMN IF NOT EXISTS descricao TEXT DEFAULT 'PLR Products',
ADD COLUMN IF NOT EXISTS main_product_label TEXT DEFAULT 'PRODUTO PRINCIPAL',
ADD COLUMN IF NOT EXISTS bonuses_label TEXT DEFAULT 'BÔNUS EXCLUSIVOS',
ADD COLUMN IF NOT EXISTS bonus1_label TEXT DEFAULT 'Bônus 1',
ADD COLUMN IF NOT EXISTS bonus2_label TEXT DEFAULT 'Bônus 2',
ADD COLUMN IF NOT EXISTS bonus3_label TEXT DEFAULT 'Bônus 3',
ADD COLUMN IF NOT EXISTS bonus4_label TEXT DEFAULT 'Bônus 4';

-- Adicionar campos na tabela apps
ALTER TABLE public.apps 
ADD COLUMN IF NOT EXISTS descricao TEXT DEFAULT 'PLR Products',
ADD COLUMN IF NOT EXISTS main_product_label TEXT DEFAULT 'PRODUTO PRINCIPAL',
ADD COLUMN IF NOT EXISTS bonuses_label TEXT DEFAULT 'BÔNUS EXCLUSIVOS',
ADD COLUMN IF NOT EXISTS bonus1_label TEXT DEFAULT 'Bônus 1',
ADD COLUMN IF NOT EXISTS bonus2_label TEXT DEFAULT 'Bônus 2',
ADD COLUMN IF NOT EXISTS bonus3_label TEXT DEFAULT 'Bônus 3',
ADD COLUMN IF NOT EXISTS bonus4_label TEXT DEFAULT 'Bônus 4';