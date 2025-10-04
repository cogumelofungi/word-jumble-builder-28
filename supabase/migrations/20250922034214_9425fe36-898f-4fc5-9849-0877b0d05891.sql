-- Update app limits for plans according to new rules
UPDATE public.plans SET app_limit = 1 WHERE name = 'Essencial';
UPDATE public.plans SET app_limit = 5 WHERE name = 'Profissional';  
UPDATE public.plans SET app_limit = 10 WHERE name = 'Empresarial';