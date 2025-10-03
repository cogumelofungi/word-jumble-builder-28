-- Criar política para permitir acesso público a apps publicados
CREATE POLICY "Public apps are viewable by everyone" 
ON public.apps 
FOR SELECT 
USING (status = 'publicado');

-- Remover a política que bloqueia acesso anônimo apenas para SELECT
DROP POLICY IF EXISTS "No anonymous access to apps table" ON public.apps;