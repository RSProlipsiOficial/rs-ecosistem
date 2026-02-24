-- Fix RLS for Alunos and Vans to support Driver/Monitor roles
-- Drivers and Monitors should only see data for THEIR assigned van.

-- 1. Enable RLS (already enabled but just in case)
ALTER TABLE public.vans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies if necessary or add new ones
-- Since 'owner only' exists, we add a new policy for collaborators.

-- VANS Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Vans: collaborators' AND tablename = 'vans') THEN
        CREATE POLICY "Vans: collaborators" ON public.vans
        FOR SELECT
        USING (
            (auth.uid() = user_id) OR 
            (id = (auth.jwt() -> 'user_metadata' ->> 'van_id')::uuid)
        );
    END IF;
END $$;

-- ALUNOS Policies
DO $$ 
BEGIN
    -- We need to replace or add to the existing "owner only"
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Alunos: collaborators' AND tablename = 'alunos') THEN
        CREATE POLICY "Alunos: collaborators" ON public.alunos
        FOR SELECT
        USING (
            (auth.uid() = user_id) OR 
            (
                van_id = (auth.jwt() -> 'user_metadata' ->> 'van_id')::uuid AND
                user_id = (auth.jwt() -> 'user_metadata' ->> 'boss_id')::uuid
            )
        );
    END IF;
END $$;

-- 3. Restrict existing "consultar todos" on vans if it exists
-- The user mentioned see multiple vans.
-- Looking at previous grep, there was a "Vans: consultar todos autenticados" policy with "true".
-- That's why they see 2 vans. We should drop it or refine it.
DROP POLICY IF EXISTS "Vans: consultar todos autenticados" ON public.vans;
DROP POLICY IF EXISTS "Vans: owner only" ON public.vans;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias vans" ON public.vans;

-- Re-Apply clean Owner policy for Vans
CREATE POLICY "Vans: owner selector" ON public.vans
FOR SELECT
USING (
    (auth.uid() = user_id) OR 
    (id = (auth.jwt() -> 'user_metadata' ->> 'van_id')::uuid)
);

-- Re-Apply clean Owner policy for Alunos (Select only for now)
DROP POLICY IF EXISTS "Alunos: owner only" ON public.alunos;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios alunos" ON public.alunos;

CREATE POLICY "Alunos: multi_role_select" ON public.alunos
FOR SELECT
USING (
    (auth.uid() = user_id) OR 
    (
        van_id = (auth.jwt() -> 'user_metadata' ->> 'van_id')::uuid AND
        user_id = (auth.jwt() -> 'user_metadata' ->> 'boss_id')::uuid
    )
);

-- Note: We DON'T allow workers to INSERT/UPDATE/DELETE by default 
-- unless they are the owner. This matches the user request "não pode adicionar/editar".
