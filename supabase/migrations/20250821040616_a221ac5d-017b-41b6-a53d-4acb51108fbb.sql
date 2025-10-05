-- Política para permitir que qualquer pessoa veja apps publicados
DROP POLICY IF EXISTS "Published apps are publicly viewable" ON public.apps;

CREATE POLICY "Published apps are publicly viewable" 
ON public.apps 
FOR SELECT 
TO public
USING (status = 'publicado');

-- Atualizar prioridade das políticas existentes para garantir que a política pública funcione
DROP POLICY IF EXISTS "Users can view their own apps" ON public.apps;
DROP POLICY IF EXISTS "Admins can view all apps" ON public.apps;

-- Recriar as políticas com ordem adequada
CREATE POLICY "Users can view their own apps" 
ON public.apps 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all apps" 
ON public.apps 
FOR SELECT 
USING (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text))));