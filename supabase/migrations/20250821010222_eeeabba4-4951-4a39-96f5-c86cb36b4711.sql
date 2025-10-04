-- Adicionar campo full_name na tabela profiles para armazenar o nome completo do usuário
ALTER TABLE public.profiles 
ADD COLUMN full_name TEXT;