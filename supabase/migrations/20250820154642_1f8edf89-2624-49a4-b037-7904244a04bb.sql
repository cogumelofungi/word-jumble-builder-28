-- Corrigir recursão infinita nas políticas RLS da tabela user_roles
-- Remover políticas problemáticas e criar novas usando a função has_role

-- Remover políticas antigas que causam recursão
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Criar nova política para admins usando a função security definer
CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Criar política para usuários verem suas próprias roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Permitir que admins insiram roles (para gerenciamento)
CREATE POLICY "Admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Permitir que admins atualizem roles
CREATE POLICY "Admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Permitir que admins deletem roles
CREATE POLICY "Admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));