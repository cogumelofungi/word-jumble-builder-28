-- Criar plano Gratuito
INSERT INTO public.plans (name, price, app_limit)
VALUES ('Gratuito', 0, 0);

-- Atualizar usuários sem plano para receberem o plano Gratuito
UPDATE public.user_status 
SET plan_id = (SELECT id FROM plans WHERE name = 'Gratuito')
WHERE plan_id IS NULL;