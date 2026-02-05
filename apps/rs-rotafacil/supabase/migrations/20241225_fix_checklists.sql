
-- Garantir que a extensão uuid-ossp existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABELA CHECKLISTS_FROTA
-- ==========================================
CREATE TABLE IF NOT EXISTS public.checklists_frota (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$
BEGIN
    -- motorista_id (que atua como user_id neste contexto)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklists_frota' AND column_name = 'motorista_id') THEN
        ALTER TABLE public.checklists_frota ADD COLUMN motorista_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklists_frota' AND column_name = 'van_id') THEN
        ALTER TABLE public.checklists_frota ADD COLUMN van_id UUID; -- Opcional FK se vans existir
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklists_frota' AND column_name = 'data_checklist') THEN
        ALTER TABLE public.checklists_frota ADD COLUMN data_checklist DATE DEFAULT CURRENT_DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklists_frota' AND column_name = 'items') THEN
        ALTER TABLE public.checklists_frota ADD COLUMN items JSONB DEFAULT '{}'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklists_frota' AND column_name = 'obs_geral') THEN
        ALTER TABLE public.checklists_frota ADD COLUMN obs_geral TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklists_frota' AND column_name = 'status') THEN
        ALTER TABLE public.checklists_frota ADD COLUMN status TEXT DEFAULT 'revisado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklists_frota' AND column_name = 'fora_horario') THEN
        ALTER TABLE public.checklists_frota ADD COLUMN fora_horario BOOLEAN DEFAULT false;
    END IF;
END $$;

-- RLS Checklists Frota
ALTER TABLE public.checklists_frota ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Motoristas podem ver seus checklists" ON public.checklists_frota;
CREATE POLICY "Motoristas podem ver seus checklists" ON public.checklists_frota FOR SELECT USING (auth.uid() = motorista_id);

DROP POLICY IF EXISTS "Motoristas podem inserir seus checklists" ON public.checklists_frota;
CREATE POLICY "Motoristas podem inserir seus checklists" ON public.checklists_frota FOR INSERT WITH CHECK (auth.uid() = motorista_id);

DROP POLICY IF EXISTS "Motoristas podem atualizar seus checklists" ON public.checklists_frota;
CREATE POLICY "Motoristas podem atualizar seus checklists" ON public.checklists_frota FOR UPDATE USING (auth.uid() = motorista_id);

DROP POLICY IF EXISTS "Motoristas podem deletar seus checklists" ON public.checklists_frota;
CREATE POLICY "Motoristas podem deletar seus checklists" ON public.checklists_frota FOR DELETE USING (auth.uid() = motorista_id);


-- ==========================================
-- 2. TABELA CHECKLIST_ITEMS_PERSONALIZADOS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.checklist_items_personalizados (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklist_items_personalizados' AND column_name = 'user_id') THEN
        ALTER TABLE public.checklist_items_personalizados ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklist_items_personalizados' AND column_name = 'nome') THEN
        ALTER TABLE public.checklist_items_personalizados ADD COLUMN nome TEXT NOT NULL DEFAULT 'Item';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklist_items_personalizados' AND column_name = 'descricao') THEN
        ALTER TABLE public.checklist_items_personalizados ADD COLUMN descricao TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklist_items_personalizados' AND column_name = 'ativo') THEN
        ALTER TABLE public.checklist_items_personalizados ADD COLUMN ativo BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklist_items_personalizados' AND column_name = 'ordem') THEN
        ALTER TABLE public.checklist_items_personalizados ADD COLUMN ordem INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklist_items_personalizados' AND column_name = 'obrigatorio') THEN
        ALTER TABLE public.checklist_items_personalizados ADD COLUMN obrigatorio BOOLEAN DEFAULT true;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklist_items_personalizados' AND column_name = 'tipo') THEN
        ALTER TABLE public.checklist_items_personalizados ADD COLUMN tipo TEXT DEFAULT 'boolean';
    END IF;
END $$;

-- RLS Checklist Items
ALTER TABLE public.checklist_items_personalizados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver seus itens de checklist" ON public.checklist_items_personalizados;
CREATE POLICY "Usuários podem ver seus itens de checklist" ON public.checklist_items_personalizados FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem gerenciar seus itens de checklist" ON public.checklist_items_personalizados;
CREATE POLICY "Usuários podem gerenciar seus itens de checklist" ON public.checklist_items_personalizados FOR ALL USING (auth.uid() = user_id);
