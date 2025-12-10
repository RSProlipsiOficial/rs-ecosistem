-- ============================================================================
-- RS ECOSYSTEM - COMMUNICATION MODULE RLS POLICIES
-- Migration: 003-communication-rls.sql
-- ============================================================================
-- Este arquivo configura Row Level Security (RLS) para todas as tabelas
-- de comunicação, garantindo segurança em produção
-- ============================================================================

-- ============================================================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ============================================================================
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tag_relations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 1. POLÍTICAS PARA: announcements
-- ============================================================================

-- Leitura pública: apenas comunicados publicados
DROP POLICY IF EXISTS "Permitir leitura de comunicados publicados" ON public.announcements;
CREATE POLICY "Permitir leitura de comunicados publicados"
    ON public.announcements
    FOR SELECT
    USING (is_published = true);

-- Service role pode ler tudo (para admin)
DROP POLICY IF EXISTS "Service role pode ler todos comunicados" ON public.announcements;
CREATE POLICY "Service role pode ler todos comunicados"
    ON public.announcements
    FOR SELECT
    TO service_role
    USING (true);

-- Apenas service_role pode criar
DROP POLICY IF EXISTS "Service role pode criar comunicados" ON public.announcements;
CREATE POLICY "Service role pode criar comunicados"
    ON public.announcements
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Apenas service_role pode atualizar
DROP POLICY IF EXISTS "Service role pode atualizar comunicados" ON public.announcements;
CREATE POLICY "Service role pode atualizar comunicados"
    ON public.announcements
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Apenas service_role pode deletar
DROP POLICY IF EXISTS "Service role pode deletar comunicados" ON public.announcements;
CREATE POLICY "Service role pode deletar comunicados"
    ON public.announcements
    FOR DELETE
    TO service_role
    USING (true);

-- ============================================================================
-- 2. POLÍTICAS PARA: agenda_items
-- ============================================================================

-- Leitura pública: apenas items ativos
DROP POLICY IF EXISTS "Permitir leitura de agenda ativa" ON public.agenda_items;
CREATE POLICY "Permitir leitura de agenda ativa"
    ON public.agenda_items
    FOR SELECT
    USING (active = true);

-- Service role pode ler tudo
DROP POLICY IF EXISTS "Service role pode ler toda agenda" ON public.agenda_items;
CREATE POLICY "Service role pode ler toda agenda"
    ON public.agenda_items
    FOR SELECT
    TO service_role
    USING (true);

-- Apenas service_role pode criar
DROP POLICY IF EXISTS "Service role pode criar agenda" ON public.agenda_items;
CREATE POLICY "Service role pode criar agenda"
    ON public.agenda_items
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Apenas service_role pode atualizar
DROP POLICY IF EXISTS "Service role pode atualizar agenda" ON public.agenda_items;
CREATE POLICY "Service role pode atualizar agenda"
    ON public.agenda_items
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Apenas service_role pode deletar (respeitando is_deletable)
DROP POLICY IF EXISTS "Service role pode deletar agenda" ON public.agenda_items;
CREATE POLICY "Service role pode deletar agenda"
    ON public.agenda_items
    FOR DELETE
    TO service_role
    USING (is_deletable = true);

-- ============================================================================
-- 3. POLÍTICAS PARA: trainings
-- ============================================================================

-- Leitura pública: apenas treinamentos publicados
DROP POLICY IF EXISTS "Permitir leitura de treinamentos publicados" ON public.trainings;
CREATE POLICY "Permitir leitura de treinamentos publicados"
    ON public.trainings
    FOR SELECT
    USING (is_published = true);

-- Service role pode ler tudo
DROP POLICY IF EXISTS "Service role pode ler todos treinamentos" ON public.trainings;
CREATE POLICY "Service role pode ler todos treinamentos"
    ON public.trainings
    FOR SELECT
    TO service_role
    USING (true);

-- Apenas service_role pode criar
DROP POLICY IF EXISTS "Service role pode criar treinamentos" ON public.trainings;
CREATE POLICY "Service role pode criar treinamentos"
    ON public.trainings
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Apenas service_role pode atualizar
DROP POLICY IF EXISTS "Service role pode atualizar treinamentos" ON public.trainings;
CREATE POLICY "Service role pode atualizar treinamentos"
    ON public.trainings
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Apenas service_role pode deletar
DROP POLICY IF EXISTS "Service role pode deletar treinamentos" ON public.trainings;
CREATE POLICY "Service role pode deletar treinamentos"
    ON public.trainings
    FOR DELETE
    TO service_role
    USING (true);

-- ============================================================================
-- 4. POLÍTICAS PARA: training_lessons
-- ============================================================================

-- Leitura pública: apenas lições de treinamentos publicados
DROP POLICY IF EXISTS "Permitir leitura de lições publicadas" ON public.training_lessons;
CREATE POLICY "Permitir leitura de lições publicadas"
    ON public.training_lessons
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.trainings
            WHERE trainings.id = training_lessons.training_id
            AND trainings.is_published = true
        )
    );

-- Service role pode ler tudo
DROP POLICY IF EXISTS "Service role pode ler todas lições" ON public.training_lessons;
CREATE POLICY "Service role pode ler todas lições"
    ON public.training_lessons
    FOR SELECT
    TO service_role
    USING (true);

-- Apenas service_role pode criar
DROP POLICY IF EXISTS "Service role pode criar lições" ON public.training_lessons;
CREATE POLICY "Service role pode criar lições"
    ON public.training_lessons
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Apenas service_role pode atualizar
DROP POLICY IF EXISTS "Service role pode atualizar lições" ON public.training_lessons;
CREATE POLICY "Service role pode atualizar lições"
    ON public.training_lessons
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Apenas service_role pode deletar
DROP POLICY IF EXISTS "Service role pode deletar lições" ON public.training_lessons;
CREATE POLICY "Service role pode deletar lições"
    ON public.training_lessons
    FOR DELETE
    TO service_role
    USING (true);

-- ============================================================================
-- 5. POLÍTICAS PARA: training_progress
-- ============================================================================

-- Usuários autenticados podem ler apenas seu próprio progresso
DROP POLICY IF EXISTS "Usuários podem ler próprio progresso" ON public.training_progress;
CREATE POLICY "Usuários podem ler próprio progresso"
    ON public.training_progress
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Service role pode ler tudo
DROP POLICY IF EXISTS "Service role pode ler todo progresso" ON public.training_progress;
CREATE POLICY "Service role pode ler todo progresso"
    ON public.training_progress
    FOR SELECT
    TO service_role
    USING (true);

-- Usuários autenticados podem criar/atualizar apenas seu próprio progresso
DROP POLICY IF EXISTS "Usuários podem criar próprio progresso" ON public.training_progress;
CREATE POLICY "Usuários podem criar próprio progresso"
    ON public.training_progress
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar próprio progresso" ON public.training_progress;
CREATE POLICY "Usuários podem atualizar próprio progresso"
    ON public.training_progress
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Service role pode criar/atualizar qualquer progresso
DROP POLICY IF EXISTS "Service role pode criar progresso" ON public.training_progress;
CREATE POLICY "Service role pode criar progresso"
    ON public.training_progress
    FOR INSERT
    TO service_role
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role pode atualizar progresso" ON public.training_progress;
CREATE POLICY "Service role pode atualizar progresso"
    ON public.training_progress
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 6. POLÍTICAS PARA: catalogs
-- ============================================================================

-- Leitura pública: apenas catálogos publicados
DROP POLICY IF EXISTS "Permitir leitura de catálogos publicados" ON public.catalogs;
CREATE POLICY "Permitir leitura de catálogos publicados"
    ON public.catalogs
    FOR SELECT
    USING (is_published = true);

-- Service role pode ler tudo
DROP POLICY IF EXISTS "Service role pode ler todos catálogos" ON public.catalogs;
CREATE POLICY "Service role pode ler todos catálogos"
    ON public.catalogs
    FOR SELECT
    TO service_role
    USING (true);

-- Apenas service_role pode criar
DROP POLICY IF EXISTS "Service role pode criar catálogos" ON public.catalogs;
CREATE POLICY "Service role pode criar catálogos"
    ON public.catalogs
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Apenas service_role pode atualizar
DROP POLICY IF EXISTS "Service role pode atualizar catálogos" ON public.catalogs;
CREATE POLICY "Service role pode atualizar catálogos"
    ON public.catalogs
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Apenas service_role pode deletar
DROP POLICY IF EXISTS "Service role pode deletar catálogos" ON public.catalogs;
CREATE POLICY "Service role pode deletar catálogos"
    ON public.catalogs
    FOR DELETE
    TO service_role
    USING (true);

-- ============================================================================
-- 7. POLÍTICAS PARA: download_materials
-- ============================================================================

-- Leitura pública: apenas materiais publicados
DROP POLICY IF EXISTS "Permitir leitura de materiais publicados" ON public.download_materials;
CREATE POLICY "Permitir leitura de materiais publicados"
    ON public.download_materials
    FOR SELECT
    USING (is_published = true);

-- Service role pode ler tudo
DROP POLICY IF EXISTS "Service role pode ler todos materiais" ON public.download_materials;
CREATE POLICY "Service role pode ler todos materiais"
    ON public.download_materials
    FOR SELECT
    TO service_role
    USING (true);

-- Apenas service_role pode criar
DROP POLICY IF EXISTS "Service role pode criar materiais" ON public.download_materials;
CREATE POLICY "Service role pode criar materiais"
    ON public.download_materials
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Apenas service_role pode atualizar
DROP POLICY IF EXISTS "Service role pode atualizar materiais" ON public.download_materials;
CREATE POLICY "Service role pode atualizar materiais"
    ON public.download_materials
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Apenas service_role pode deletar
DROP POLICY IF EXISTS "Service role pode deletar materiais" ON public.download_materials;
CREATE POLICY "Service role pode deletar materiais"
    ON public.download_materials
    FOR DELETE
    TO service_role
    USING (true);

-- ============================================================================
-- 8. POLÍTICAS PARA: download_logs
-- ============================================================================

-- Usuários autenticados podem criar logs de seus próprios downloads
DROP POLICY IF EXISTS "Usuários podem criar próprios logs" ON public.download_logs;
CREATE POLICY "Usuários podem criar próprios logs"
    ON public.download_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Service role pode criar qualquer log
DROP POLICY IF EXISTS "Service role pode criar logs" ON public.download_logs;
CREATE POLICY "Service role pode criar logs"
    ON public.download_logs
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Service role pode ler todos os logs
DROP POLICY IF EXISTS "Service role pode ler logs" ON public.download_logs;
CREATE POLICY "Service role pode ler logs"
    ON public.download_logs
    FOR SELECT
    TO service_role
    USING (true);

-- ============================================================================
-- 9. POLÍTICAS PARA: content_tags
-- ============================================================================

-- Leitura pública de todas as tags
DROP POLICY IF EXISTS "Permitir leitura de tags" ON public.content_tags;
CREATE POLICY "Permitir leitura de tags"
    ON public.content_tags
    FOR SELECT
    USING (true);

-- Apenas service_role pode criar
DROP POLICY IF EXISTS "Service role pode criar tags" ON public.content_tags;
CREATE POLICY "Service role pode criar tags"
    ON public.content_tags
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Apenas service_role pode atualizar
DROP POLICY IF EXISTS "Service role pode atualizar tags" ON public.content_tags;
CREATE POLICY "Service role pode atualizar tags"
    ON public.content_tags
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Apenas service_role pode deletar
DROP POLICY IF EXISTS "Service role pode deletar tags" ON public.content_tags;
CREATE POLICY "Service role pode deletar tags"
    ON public.content_tags
    FOR DELETE
    TO service_role
    USING (true);

-- ============================================================================
-- 10. POLÍTICAS PARA: content_tag_relations
-- ============================================================================

-- Leitura pública de todas as relações
DROP POLICY IF EXISTS "Permitir leitura de relações" ON public.content_tag_relations;
CREATE POLICY "Permitir leitura de relações"
    ON public.content_tag_relations
    FOR SELECT
    USING (true);

-- Apenas service_role pode criar
DROP POLICY IF EXISTS "Service role pode criar relações" ON public.content_tag_relations;
CREATE POLICY "Service role pode criar relações"
    ON public.content_tag_relations
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Apenas service_role pode deletar
DROP POLICY IF EXISTS "Service role pode deletar relações" ON public.content_tag_relations;
CREATE POLICY "Service role pode deletar relações"
    ON public.content_tag_relations
    FOR DELETE
    TO service_role
    USING (true);

-- ============================================================================
-- VERIFICAÇÃO: Listar todas as políticas criadas
-- ============================================================================
-- Execute esta query para verificar se todas as políticas foram criadas:
--
-- SELECT 
--     tablename,
--     policyname,
--     cmd,
--     roles
-- FROM pg_policies
-- WHERE tablename IN (
--     'announcements', 'agenda_items', 'trainings', 'training_lessons',
--     'training_progress', 'catalogs', 'download_materials', 'download_logs',
--     'content_tags', 'content_tag_relations'
-- )
-- ORDER BY tablename, cmd;

-- ============================================================================
-- FIM DA MIGRATION RLS
-- ============================================================================
