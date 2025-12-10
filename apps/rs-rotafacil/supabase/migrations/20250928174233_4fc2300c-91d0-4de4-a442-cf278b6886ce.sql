-- Remove foreign key constraint from vans table to allow testing without auth
ALTER TABLE public.vans DROP CONSTRAINT IF EXISTS vans_user_id_fkey;

-- Make user_id nullable and set a default value for testing
ALTER TABLE public.vans ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.vans ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000000';

-- Do the same for alunos table
ALTER TABLE public.alunos DROP CONSTRAINT IF EXISTS alunos_user_id_fkey;
ALTER TABLE public.alunos ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.alunos ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000000';