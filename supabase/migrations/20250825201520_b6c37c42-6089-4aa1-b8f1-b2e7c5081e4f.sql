-- Recriar política que bloqueia acesso anônimo apenas para INSERT, UPDATE, DELETE
CREATE POLICY "No anonymous write access to apps table" 
ON public.apps 
FOR INSERT, UPDATE, DELETE
USING (false);