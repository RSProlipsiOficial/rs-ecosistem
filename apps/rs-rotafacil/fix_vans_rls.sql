-- CORREÇÃO URGENTE: Recursão infinita nas políticas RLS da tabela vans
-- Problema: A política estava referenciando a própria tabela vans causando loop

-- 1. Remover todas as políticas antigas da tabela vans
DROP POLICY IF EXISTS "Vans: dynamic_visibility" ON vans;
DROP POLICY IF EXISTS "Guardian can view their students van" ON vans;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias vans" ON vans;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias vans" ON vans;
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias vans" ON vans;
DROP POLICY IF EXISTS "Users can view their own vans" ON vans;
DROP POLICY IF EXISTS "Users can insert their own vans" ON vans;
DROP POLICY IF EXISTS "Users can update their own vans" ON vans;
DROP POLICY IF EXISTS "Users can delete their own vans" ON vans;

-- 2. Criar políticas SIMPLES e SEM RECURSÃO

-- SELECT: Usuário pode ver suas próprias vans
CREATE POLICY "Users can view own vans"
ON vans FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Usuário pode criar suas próprias vans
CREATE POLICY "Users can insert own vans"
ON vans FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Usuário pode atualizar suas próprias vans
CREATE POLICY "Users can update own vans"
ON vans FOR UPDATE
USING (auth.uid() = user_id);

-- DELETE: Usuário pode deletar suas próprias vans
CREATE POLICY "Users can delete own vans"
ON vans FOR DELETE
USING (auth.uid() = user_id);

-- 3. Política para responsáveis verem a van dos seus alunos (SEM RECURSÃO)
CREATE POLICY "Guardians view student vans"
ON vans FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM alunos a
    JOIN responsavel_alunos ra ON ra.aluno_id = a.id
    WHERE a.van_id = vans.id 
    AND ra.responsavel_id = auth.uid()
  )
);
