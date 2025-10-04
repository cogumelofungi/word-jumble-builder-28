-- Criar tabela de planos
CREATE TABLE public.plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  app_limit INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir os 3 planos
INSERT INTO public.plans (name, app_limit) VALUES 
  ('Essencial', 1),
  ('Profissional', 3),
  ('Empresarial', 10);

-- Adicionar coluna plan_id na tabela user_status
ALTER TABLE public.user_status 
ADD COLUMN plan_id UUID REFERENCES public.plans(id);

-- Adicionar coluna last_renewal_date para planos recorrentes
ALTER TABLE public.user_status 
ADD COLUMN last_renewal_date TIMESTAMP WITH TIME ZONE;

-- Definir todos os usuários existentes com plano "Empresarial"
UPDATE public.user_status 
SET plan_id = (SELECT id FROM public.plans WHERE name = 'Empresarial')
WHERE plan_id IS NULL;

-- Enable RLS nos planos
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Política para visualizar planos (qualquer um pode ver)
CREATE POLICY "Anyone can view plans" 
ON public.plans 
FOR SELECT 
USING (true);

-- Trigger para atualizar updated_at nos planos
CREATE TRIGGER update_plans_updated_at
BEFORE UPDATE ON public.plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();