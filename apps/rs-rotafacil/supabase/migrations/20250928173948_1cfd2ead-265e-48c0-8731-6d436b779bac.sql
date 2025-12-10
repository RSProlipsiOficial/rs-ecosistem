-- Temporarily disable RLS for testing purposes
-- This allows creating vans and alunos without authentication
ALTER TABLE public.vans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos DISABLE ROW LEVEL SECURITY;