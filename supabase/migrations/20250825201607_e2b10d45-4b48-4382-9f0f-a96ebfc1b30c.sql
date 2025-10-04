-- Criar políticas separadas para INSERT, UPDATE, DELETE para bloquear acesso anônimo
CREATE POLICY "No anonymous insert access to apps table" 
ON public.apps 
FOR INSERT
WITH CHECK (false);

CREATE POLICY "No anonymous update access to apps table" 
ON public.apps 
FOR UPDATE
USING (false);

CREATE POLICY "No anonymous delete access to apps table" 
ON public.apps 
FOR DELETE
USING (false);