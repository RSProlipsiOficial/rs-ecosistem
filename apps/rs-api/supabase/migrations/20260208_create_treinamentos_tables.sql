-- Create tables for Training Center (replicating Rota Fácil structure)

-- 1. Cursos (Courses/Tracks)
CREATE TABLE IF NOT EXISTS treinamento_cursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT, -- Added for multi-tenancy compatibility with rs-api
    titulo TEXT NOT NULL,
    descricao TEXT,
    icone TEXT,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Módulos (Modules)
CREATE TABLE IF NOT EXISTS treinamento_modulos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT,
    curso_id UUID REFERENCES treinamento_cursos(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    icone TEXT,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Aulas (Lessons)
CREATE TABLE IF NOT EXISTS treinamento_aulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT,
    modulo_id UUID REFERENCES treinamento_modulos(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    link_video TEXT,
    material_complementar TEXT,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Progresso (Progress)
CREATE TABLE IF NOT EXISTS treinamento_progresso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT,
    user_id UUID NOT NULL, -- References auth.users or profiles
    aula_id UUID REFERENCES treinamento_aulas(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT true,
    liked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, aula_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_treinamento_cursos_tenant ON treinamento_cursos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_treinamento_modulos_curso ON treinamento_modulos(curso_id);
CREATE INDEX IF NOT EXISTS idx_treinamento_aulas_modulo ON treinamento_aulas(modulo_id);
CREATE INDEX IF NOT EXISTS idx_treinamento_progresso_user ON treinamento_progresso(user_id);
