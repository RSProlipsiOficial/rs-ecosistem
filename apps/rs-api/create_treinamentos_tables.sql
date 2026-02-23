-- Create tables for Training Center (replicating Rota Fácil structure)
-- Using IF NOT EXISTS for tables and ALTER TABLE for columns to be safe

-- 1. Cursos (Courses/Tracks)
CREATE TABLE IF NOT EXISTS treinamento_cursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descricao TEXT,
    icone TEXT,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- Add tenant_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treinamento_cursos' AND column_name = 'tenant_id') THEN
        ALTER TABLE treinamento_cursos ADD COLUMN tenant_id TEXT;
    END IF;
END $$;


-- 2. Módulos (Modules)
CREATE TABLE IF NOT EXISTS treinamento_modulos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descricao TEXT,
    icone TEXT,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treinamento_modulos' AND column_name = 'tenant_id') THEN
        ALTER TABLE treinamento_modulos ADD COLUMN tenant_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treinamento_modulos' AND column_name = 'curso_id') THEN
        ALTER TABLE treinamento_modulos ADD COLUMN curso_id UUID REFERENCES treinamento_cursos(id) ON DELETE CASCADE;
    END IF;
END $$;


-- 3. Aulas (Lessons)
CREATE TABLE IF NOT EXISTS treinamento_aulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descricao TEXT,
    link_video TEXT,
    material_complementar TEXT,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treinamento_aulas' AND column_name = 'tenant_id') THEN
        ALTER TABLE treinamento_aulas ADD COLUMN tenant_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treinamento_aulas' AND column_name = 'modulo_id') THEN
        ALTER TABLE treinamento_aulas ADD COLUMN modulo_id UUID REFERENCES treinamento_modulos(id) ON DELETE CASCADE;
    END IF;
END $$;


-- 4. Progresso (Progress)
CREATE TABLE IF NOT EXISTS treinamento_progresso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    completed BOOLEAN DEFAULT true,
    liked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treinamento_progresso' AND column_name = 'tenant_id') THEN
        ALTER TABLE treinamento_progresso ADD COLUMN tenant_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treinamento_progresso' AND column_name = 'aula_id') THEN
        ALTER TABLE treinamento_progresso ADD COLUMN aula_id UUID REFERENCES treinamento_aulas(id) ON DELETE CASCADE;
    END IF;
    -- Add Unique Constraint if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'treinamento_progresso_user_id_aula_id_key') THEN
        ALTER TABLE treinamento_progresso ADD UNIQUE(user_id, aula_id);
    END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_treinamento_cursos_tenant ON treinamento_cursos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_treinamento_modulos_curso ON treinamento_modulos(curso_id);
CREATE INDEX IF NOT EXISTS idx_treinamento_aulas_modulo ON treinamento_aulas(modulo_id);
CREATE INDEX IF NOT EXISTS idx_treinamento_progresso_user ON treinamento_progresso(user_id);
