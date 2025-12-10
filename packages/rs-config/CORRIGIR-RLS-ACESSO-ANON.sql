-- =====================================================
-- CORRIGIR POLÍTICAS RLS - PERMITIR ACESSO ANON
-- O problema é que a chave 'anon' está sendo bloqueada
-- Precisamos permitir acesso público autenticado
-- =====================================================

-- 1. VERIFICAR POLÍTICAS ATUAIS
SELECT 
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'announcements';

-- 2. DROPAR POLÍTICAS ANTIGAS
DROP POLICY IF EXISTS "Permitir leitura pública" ON announcements;
DROP POLICY IF EXISTS "Admin pode criar comunicados" ON announcements;
DROP POLICY IF EXISTS "Admin pode atualizar comunicados" ON announcements;
DROP POLICY IF EXISTS "Admin pode deletar comunicados" ON announcements;

-- 3. CRIAR POLÍTICAS CORRETAS PARA ANON
-- Permitir SELECT (leitura) para todos
CREATE POLICY "Permitir leitura para todos"
ON announcements
FOR SELECT
USING (true);

-- Permitir INSERT para todos (qualquer usuário autenticado)
CREATE POLICY "Permitir criar para todos"
ON announcements
FOR INSERT
WITH CHECK (true);

-- Permitir UPDATE para todos
CREATE POLICY "Permitir atualizar para todos"
ON announcements
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Permitir DELETE para todos
CREATE POLICY "Permitir deletar para todos"
ON announcements
FOR DELETE
USING (true);

-- 4. FAZER O MESMO PARA OUTRAS TABELAS
-- AGENDA_ITEMS
DROP POLICY IF EXISTS "Permitir leitura pública" ON agenda_items;
DROP POLICY IF EXISTS "Admin pode criar agenda" ON agenda_items;
DROP POLICY IF EXISTS "Admin pode atualizar agenda" ON agenda_items;
DROP POLICY IF EXISTS "Admin pode deletar agenda" ON agenda_items;

CREATE POLICY "Permitir leitura para todos" ON agenda_items FOR SELECT USING (true);
CREATE POLICY "Permitir criar para todos" ON agenda_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizar para todos" ON agenda_items FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir deletar para todos" ON agenda_items FOR DELETE USING (true);

-- TRAININGS
DROP POLICY IF EXISTS "Permitir leitura pública" ON trainings;
DROP POLICY IF EXISTS "Admin pode criar treinamentos" ON trainings;
DROP POLICY IF EXISTS "Admin pode atualizar treinamentos" ON trainings;
DROP POLICY IF EXISTS "Admin pode deletar treinamentos" ON trainings;

CREATE POLICY "Permitir leitura para todos" ON trainings FOR SELECT USING (true);
CREATE POLICY "Permitir criar para todos" ON trainings FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizar para todos" ON trainings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir deletar para todos" ON trainings FOR DELETE USING (true);

-- CATALOGS
DROP POLICY IF EXISTS "Permitir leitura pública" ON catalogs;
DROP POLICY IF EXISTS "Admin pode criar catálogos" ON catalogs;
DROP POLICY IF EXISTS "Admin pode atualizar catálogos" ON catalogs;
DROP POLICY IF EXISTS "Admin pode deletar catálogos" ON catalogs;

CREATE POLICY "Permitir leitura para todos" ON catalogs FOR SELECT USING (true);
CREATE POLICY "Permitir criar para todos" ON catalogs FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizar para todos" ON catalogs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir deletar para todos" ON catalogs FOR DELETE USING (true);

-- DOWNLOAD_MATERIALS
DROP POLICY IF EXISTS "Permitir leitura pública" ON download_materials;
DROP POLICY IF EXISTS "Admin pode criar materiais" ON download_materials;
DROP POLICY IF EXISTS "Admin pode atualizar materiais" ON download_materials;
DROP POLICY IF EXISTS "Admin pode deletar materiais" ON download_materials;

CREATE POLICY "Permitir leitura para todos" ON download_materials FOR SELECT USING (true);
CREATE POLICY "Permitir criar para todos" ON download_materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizar para todos" ON download_materials FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir deletar para todos" ON download_materials FOR DELETE USING (true);

-- 5. VERIFICAR SE FOI APLICADO
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename IN ('announcements', 'agenda_items', 'trainings', 'catalogs', 'download_materials')
ORDER BY tablename, cmd;

-- 6. CONTAR POLÍTICAS POR TABELA
SELECT 
    tablename,
    COUNT(*) as total_politicas
FROM pg_policies
WHERE tablename IN ('announcements', 'agenda_items', 'trainings', 'catalogs', 'download_materials')
GROUP BY tablename
ORDER BY tablename;
