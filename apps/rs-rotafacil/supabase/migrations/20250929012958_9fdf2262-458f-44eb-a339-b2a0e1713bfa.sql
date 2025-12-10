-- Adicionar campo avatar_url à tabela user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN avatar_url TEXT;