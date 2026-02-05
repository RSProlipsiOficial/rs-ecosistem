-- Migration: Fix infinite recursion in vans RLS policies
-- Created: 2026-01-12
-- Description: Remove recursive policies and create simple, direct policies

BEGIN;

-- 1. Drop all existing policies on vans table
DROP POLICY IF EXISTS "Vans: dynamic_visibility" ON vans;
DROP POLICY IF EXISTS "Guardian can view their students van" ON vans;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias vans" ON vans;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias vans" ON vans;
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias vans" ON vans;
DROP POLICY IF EXISTS "Users can view their own vans" ON vans;
DROP POLICY IF EXISTS "Users can insert their own vans" ON vans;
DROP POLICY IF EXISTS "Users can update their own vans" ON vans;
DROP POLICY IF EXISTS "Users can delete their own vans" ON vans;
DROP POLICY IF EXISTS "Guardians view student vans" ON vans;

-- 2. Create simple, non-recursive policies

-- Allow users to view their own vans
CREATE POLICY "vans_select_own"
ON vans FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to insert their own vans
CREATE POLICY "vans_insert_own"
ON vans FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own vans
CREATE POLICY "vans_update_own"
ON vans FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own vans
CREATE POLICY "vans_delete_own"
ON vans FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Allow guardians to view vans of their students (NO RECURSION)
CREATE POLICY "vans_select_guardian"
ON vans FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT DISTINCT a.van_id
    FROM alunos a
    INNER JOIN responsavel_alunos ra ON ra.aluno_id = a.id
    WHERE ra.responsavel_id = auth.uid()
    AND a.van_id IS NOT NULL
  )
);

COMMIT;
