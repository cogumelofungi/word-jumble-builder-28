-- Corrigir o limite de apps do Plano Empresarial para 10
UPDATE public.plans 
SET app_limit = 10 
WHERE name = 'Empresarial';