-- Criar tabelas para o App Builder

-- Tabela de aplicativos rascunho (temporários)
CREATE TABLE public.draft_apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL DEFAULT 'Meu App PLR',
  cor TEXT NOT NULL DEFAULT '#4783F6',
  icone_url TEXT,
  capa_url TEXT,
  link_personalizado TEXT,
  produto_principal_url TEXT,
  bonus1_url TEXT,
  bonus2_url TEXT,
  bonus3_url TEXT,
  bonus4_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de aplicativos publicados
CREATE TABLE public.apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  cor TEXT NOT NULL,
  icone_url TEXT,
  capa_url TEXT,
  link_personalizado TEXT,
  produto_principal_url TEXT,
  bonus1_url TEXT,
  bonus2_url TEXT,
  bonus3_url TEXT,
  bonus4_url TEXT,
  status TEXT NOT NULL DEFAULT 'publicado',
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.draft_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;

-- Políticas para draft_apps (rascunhos)
CREATE POLICY "Usuários podem ver seus próprios rascunhos" 
ON public.draft_apps 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios rascunhos" 
ON public.draft_apps 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios rascunhos" 
ON public.draft_apps 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios rascunhos" 
ON public.draft_apps 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para apps (publicados)
CREATE POLICY "Apps publicados são visíveis para todos" 
ON public.apps 
FOR SELECT 
USING (true);

CREATE POLICY "Usuários podem criar seus próprios apps" 
ON public.apps 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios apps" 
ON public.apps 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios apps" 
ON public.apps 
FOR DELETE 
USING (auth.uid() = user_id);

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar timestamps
CREATE TRIGGER update_draft_apps_updated_at
BEFORE UPDATE ON public.draft_apps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_apps_updated_at
BEFORE UPDATE ON public.apps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar bucket de storage para uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('app-assets', 'app-assets', true);

-- Políticas de storage
CREATE POLICY "Usuários podem fazer upload de seus próprios assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'app-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Assets dos apps são públicos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'app-assets');

CREATE POLICY "Usuários podem atualizar seus próprios assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'app-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem deletar seus próprios assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'app-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Função para gerar slug único
CREATE OR REPLACE FUNCTION public.generate_unique_slug(base_slug TEXT, app_name TEXT)
RETURNS TEXT AS $$
DECLARE
  final_slug TEXT;
  counter INTEGER := 0;
  slug_candidate TEXT;
BEGIN
  -- Se não foi fornecido slug personalizado, gerar baseado no nome
  IF base_slug IS NULL OR base_slug = '' THEN
    base_slug := lower(regexp_replace(app_name, '[^a-zA-Z0-9]', '-', 'g'));
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
  END IF;
  
  slug_candidate := base_slug;
  
  -- Verificar se slug existe e incrementar se necessário
  WHILE EXISTS (SELECT 1 FROM public.apps WHERE slug = slug_candidate) LOOP
    counter := counter + 1;
    slug_candidate := base_slug || '-' || counter::text;
  END LOOP;
  
  RETURN slug_candidate;
END;
$$ LANGUAGE plpgsql;