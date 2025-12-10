-- ============================================================================
-- RS ECOSYSTEM - COMMUNICATION MODULE TABLES
-- Migration: 002-communication-tables.sql
-- ============================================================================
-- Este arquivo cria TODAS as tabelas necessárias para o módulo de comunicação
-- usado por rs-admin e rs-consultor via rs-api
-- ============================================================================

-- ============================================================================
-- 1. TABELA: announcements (Mural de Comunicados)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    type VARCHAR(50) DEFAULT 'info',  -- 'alert', 'info', 'promo'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    audience TEXT[] DEFAULT ARRAY['consultor', 'marketplace'],  -- ['consultor', 'marketplace', 'lojista']
    is_new BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT false,
    author VARCHAR(255),
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.announcements IS 'Comunicados gerais do admin para consultores e marketplace';
COMMENT ON COLUMN public.announcements.type IS 'Tipo de comunicado: alert (urgente), info (informativo), promo (promoção)';
COMMENT ON COLUMN public.announcements.audience IS 'Array de públicos-alvo: consultor, marketplace, lojista';
COMMENT ON COLUMN public.announcements.is_new IS 'Marca comunicado como "novo" na interface';
COMMENT ON COLUMN public.announcements.is_published IS 'Se false, não aparece para consultores';

-- ============================================================================
-- 2. TABELA: agenda_items (Agenda Comemorativa)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.agenda_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    category VARCHAR(100) NOT NULL,  -- 'Boas-vindas', 'Aniversariantes', 'PINs', 'Datas Comemorativas'
    title VARCHAR(255) NOT NULL,
    content TEXT,
    is_deletable BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.agenda_items IS 'Mensagens automáticas para datas e conquistas especiais';
COMMENT ON COLUMN public.agenda_items.category IS 'Categoria: Boas-vindas, Aniversariantes, PINs, Datas Comemorativas';
COMMENT ON COLUMN public.agenda_items.is_deletable IS 'Se false, item não pode ser deletado (sistema)';
COMMENT ON COLUMN public.agenda_items.active IS 'Se false, item não aparece na agenda';

-- ============================================================================
-- 3. TABELA: trainings (Central de Treinamentos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.trainings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    cover_image TEXT,  -- URL ou base64
    video_url TEXT,
    video_type VARCHAR(50) DEFAULT 'none',  -- 'youtube', 'vimeo', 'upload', 'none'
    duration INTEGER DEFAULT 0,  -- em segundos
    difficulty VARCHAR(50) DEFAULT 'beginner',  -- 'beginner', 'intermediate', 'advanced'
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.trainings IS 'Cursos e treinamentos para consultores';
COMMENT ON COLUMN public.trainings.video_type IS 'Tipo de vídeo: youtube, vimeo, upload (arquivo), none';
COMMENT ON COLUMN public.trainings.difficulty IS 'Nível: beginner, intermediate, advanced';
COMMENT ON COLUMN public.trainings.order_index IS 'Ordem de exibição (menor = primeiro)';
COMMENT ON COLUMN public.trainings.is_published IS 'Se false, não aparece para consultores';

-- ============================================================================
-- 4. TABELA: training_lessons (Lições de Treinamento)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.training_lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    video_url TEXT,
    duration INTEGER DEFAULT 0,  -- em segundos
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.training_lessons IS 'Lições individuais dentro de um treinamento';
COMMENT ON COLUMN public.training_lessons.training_id IS 'FK para trainings';
COMMENT ON COLUMN public.training_lessons.order_index IS 'Ordem da lição dentro do treinamento';

-- ============================================================================
-- 5. TABELA: training_progress (Progresso do Consultor)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.training_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,  -- ID do consultor
    training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.training_lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    progress_percent INTEGER DEFAULT 0,  -- 0-100
    last_position INTEGER DEFAULT 0,  -- posição do vídeo em segundos
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, training_id, lesson_id)
);

COMMENT ON TABLE public.training_progress IS 'Progresso individual de cada consultor nos treinamentos';
COMMENT ON COLUMN public.training_progress.user_id IS 'UUID do consultor';
COMMENT ON COLUMN public.training_progress.progress_percent IS 'Percentual de conclusão (0-100)';
COMMENT ON COLUMN public.training_progress.last_position IS 'Última posição do vídeo em segundos';

-- ============================================================================
-- 6. TABELA: catalogs (Catálogos de Produtos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.catalogs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image TEXT,  -- URL ou base64
    pdf_url TEXT,
    source_type VARCHAR(50) DEFAULT 'none',  -- 'file', 'url', 'none'
    file_name VARCHAR(255),
    file_size BIGINT,  -- em bytes
    category VARCHAR(100),
    is_published BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.catalogs IS 'Catálogos de produtos em PDF';
COMMENT ON COLUMN public.catalogs.source_type IS 'Origem: file (upload), url (link externo), none';
COMMENT ON COLUMN public.catalogs.file_size IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN public.catalogs.is_published IS 'Se false, não aparece para consultores';

-- ============================================================================
-- 7. TABELA: download_materials (Materiais para Download)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.download_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon_type VARCHAR(50) DEFAULT 'document',  -- 'photo', 'document', 'presentation'
    file_url TEXT,
    source_type VARCHAR(50) DEFAULT 'none',  -- 'file', 'url', 'none'
    file_name VARCHAR(255),
    file_size BIGINT,  -- em bytes
    category VARCHAR(100),
    is_published BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.download_materials IS 'Materiais diversos para download (documentos, imagens, apresentações)';
COMMENT ON COLUMN public.download_materials.icon_type IS 'Tipo de ícone: photo, document, presentation';
COMMENT ON COLUMN public.download_materials.source_type IS 'Origem: file (upload), url (link externo), none';
COMMENT ON COLUMN public.download_materials.is_published IS 'Se false, não aparece para consultores';

-- ============================================================================
-- 8. TABELA: download_logs (Auditoria de Downloads)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.download_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,  -- ID do consultor
    resource_type VARCHAR(50) NOT NULL,  -- 'catalog', 'material'
    resource_id UUID NOT NULL,  -- ID do catálogo ou material
    downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.download_logs IS 'Log de downloads para auditoria e analytics';
COMMENT ON COLUMN public.download_logs.resource_type IS 'Tipo de recurso: catalog, material';
COMMENT ON COLUMN public.download_logs.resource_id IS 'UUID do catálogo ou material baixado';

-- ============================================================================
-- 9. TABELA: content_tags (Tags de Conteúdo)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.content_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#FFD700',  -- hex color
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);

COMMENT ON TABLE public.content_tags IS 'Tags para categorizar conteúdos (treinamentos, materiais, etc)';
COMMENT ON COLUMN public.content_tags.slug IS 'Versão URL-friendly do nome (único por tenant)';
COMMENT ON COLUMN public.content_tags.color IS 'Cor da tag em hexadecimal (#RRGGBB)';

-- ============================================================================
-- 10. TABELA: content_tag_relations (Relações Tag ↔ Conteúdo)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.content_tag_relations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tag_id UUID NOT NULL REFERENCES public.content_tags(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL,  -- 'training', 'catalog', 'material', 'announcement'
    content_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tag_id, content_type, content_id)
);

COMMENT ON TABLE public.content_tag_relations IS 'Relação N:N entre tags e conteúdos';
COMMENT ON COLUMN public.content_tag_relations.content_type IS 'Tipo: training, catalog, material, announcement';
COMMENT ON COLUMN public.content_tag_relations.content_id IS 'UUID do conteúdo taggeado';

-- ============================================================================
-- FUNÇÃO: Atualizar updated_at automaticamente
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Trigger function para atualizar updated_at automaticamente';

-- ============================================================================
-- TRIGGERS: updated_at para todas as tabelas
-- ============================================================================
DROP TRIGGER IF EXISTS update_announcements_updated_at ON public.announcements;
CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON public.announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agenda_items_updated_at ON public.agenda_items;
CREATE TRIGGER update_agenda_items_updated_at
    BEFORE UPDATE ON public.agenda_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trainings_updated_at ON public.trainings;
CREATE TRIGGER update_trainings_updated_at
    BEFORE UPDATE ON public.trainings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_training_lessons_updated_at ON public.training_lessons;
CREATE TRIGGER update_training_lessons_updated_at
    BEFORE UPDATE ON public.training_lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_training_progress_updated_at ON public.training_progress;
CREATE TRIGGER update_training_progress_updated_at
    BEFORE UPDATE ON public.training_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_catalogs_updated_at ON public.catalogs;
CREATE TRIGGER update_catalogs_updated_at
    BEFORE UPDATE ON public.catalogs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_download_materials_updated_at ON public.download_materials;
CREATE TRIGGER update_download_materials_updated_at
    BEFORE UPDATE ON public.download_materials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ÍNDICES: Performance para queries comuns
-- ============================================================================

-- Índices para announcements
CREATE INDEX IF NOT EXISTS idx_announcements_tenant ON public.announcements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON public.announcements(is_published);
CREATE INDEX IF NOT EXISTS idx_announcements_tenant_published ON public.announcements(tenant_id, is_published);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements(created_at DESC);

-- Índices para agenda_items
CREATE INDEX IF NOT EXISTS idx_agenda_items_tenant ON public.agenda_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agenda_items_category ON public.agenda_items(category);
CREATE INDEX IF NOT EXISTS idx_agenda_items_active ON public.agenda_items(active);

-- Índices para trainings
CREATE INDEX IF NOT EXISTS idx_trainings_tenant ON public.trainings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_trainings_published ON public.trainings(is_published);
CREATE INDEX IF NOT EXISTS idx_trainings_tenant_published ON public.trainings(tenant_id, is_published);
CREATE INDEX IF NOT EXISTS idx_trainings_order ON public.trainings(order_index);

-- Índices para training_lessons
CREATE INDEX IF NOT EXISTS idx_training_lessons_training_id ON public.training_lessons(training_id);
CREATE INDEX IF NOT EXISTS idx_training_lessons_order ON public.training_lessons(training_id, order_index);

-- Índices para training_progress
CREATE INDEX IF NOT EXISTS idx_training_progress_user ON public.training_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_training ON public.training_progress(training_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_user_training ON public.training_progress(user_id, training_id);

-- Índices para catalogs
CREATE INDEX IF NOT EXISTS idx_catalogs_tenant ON public.catalogs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_catalogs_published ON public.catalogs(is_published);
CREATE INDEX IF NOT EXISTS idx_catalogs_tenant_published ON public.catalogs(tenant_id, is_published);

-- Índices para download_materials
CREATE INDEX IF NOT EXISTS idx_materials_tenant ON public.download_materials(tenant_id);
CREATE INDEX IF NOT EXISTS idx_materials_published ON public.download_materials(is_published);
CREATE INDEX IF NOT EXISTS idx_materials_tenant_published ON public.download_materials(tenant_id, is_published);

-- Índices para download_logs
CREATE INDEX IF NOT EXISTS idx_download_logs_user ON public.download_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_resource ON public.download_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_downloaded_at ON public.download_logs(downloaded_at DESC);

-- Índices para content_tags
CREATE INDEX IF NOT EXISTS idx_content_tags_tenant ON public.content_tags(tenant_id);
CREATE INDEX IF NOT EXISTS idx_content_tags_slug ON public.content_tags(slug);

-- Índices para content_tag_relations
CREATE INDEX IF NOT EXISTS idx_tag_relations_tag ON public.content_tag_relations(tag_id);
CREATE INDEX IF NOT EXISTS idx_tag_relations_content ON public.content_tag_relations(content_type, content_id);

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
