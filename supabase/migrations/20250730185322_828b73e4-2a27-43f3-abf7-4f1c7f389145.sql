-- Criar tabela para configurações do sistema
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para controle de usuários
CREATE TABLE IF NOT EXISTS public.user_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para integrações
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para admin_settings (apenas visualização para todos)
CREATE POLICY "Anyone can view admin settings" 
ON public.admin_settings 
FOR SELECT 
USING (true);

-- Políticas RLS para user_status
CREATE POLICY "Users can view their own status" 
ON public.user_status 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own status" 
ON public.user_status 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own status" 
ON public.user_status 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para integrations (apenas visualização para todos)
CREATE POLICY "Anyone can view integrations" 
ON public.integrations 
FOR SELECT 
USING (true);

-- Trigger para update_updated_at nas novas tabelas
CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_status_updated_at
BEFORE UPDATE ON public.user_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
BEFORE UPDATE ON public.integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configurações padrão
INSERT INTO public.admin_settings (key, value) VALUES 
('default_language', 'pt'),
('terms_of_use', 'Termos de uso padrão'),
('revision_limit', '3'),
('cancellation_message', 'Contrato cancelado')
ON CONFLICT (key) DO NOTHING;

-- Inserir integrações padrão
INSERT INTO public.integrations (name, config, is_active) VALUES 
('activecampaign', '{"api_url": "", "api_key": "", "list_id": "", "tag": ""}', false),
('make', '{"webhook_url": "", "auto_cancel": false}', false)
ON CONFLICT DO NOTHING;