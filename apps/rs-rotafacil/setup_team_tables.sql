
-- ==========================================================
-- SCRIPT DE CONFIGURAÇÃO DO BANCO DE DADOS (RotaFácil)
-- Execute este script no SQL Editor do seu Supabase
-- ==========================================================

-- 1. TABELA VANS (Veículos da Equipe)
CREATE TABLE IF NOT EXISTS public.vans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    nome TEXT NOT NULL,
    placa TEXT,
    capacidade_maxima INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.vans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vans: consultar todos autenticados" ON public.vans;
DROP POLICY IF EXISTS "Vans: inserir próprio" ON public.vans;
DROP POLICY IF EXISTS "Vans: editar próprio" ON public.vans;

CREATE POLICY "Vans: consultar todos autenticados" ON public.vans FOR SELECT USING (true);
CREATE POLICY "Vans: inserir próprio" ON public.vans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Vans: editar próprio" ON public.vans FOR UPDATE USING (auth.uid() = user_id);


-- 2. TABELA CHECKLISTS_FROTA (Vistorias dos Motoristas)
CREATE TABLE IF NOT EXISTS public.checklists_frota (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    motorista_id UUID NOT NULL REFERENCES auth.users(id),
    van_id UUID NOT NULL REFERENCES public.vans(id),
    data_checklist DATE NOT NULL DEFAULT CURRENT_DATE,
    items JSONB DEFAULT '{}'::jsonb,
    obs_geral TEXT,
    status TEXT DEFAULT 'revisado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.checklists_frota ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Checklists: consultar todos autenticados" ON public.checklists_frota;
DROP POLICY IF EXISTS "Checklists: inserir próprio" ON public.checklists_frota;

CREATE POLICY "Checklists: consultar todos autenticados" ON public.checklists_frota FOR SELECT USING (true);
CREATE POLICY "Checklists: inserir próprio" ON public.checklists_frota FOR INSERT WITH CHECK (auth.uid() = motorista_id);


-- 3. TABELA LISTA_PRESENCA (Registros das Monitoras)
CREATE TABLE IF NOT EXISTS public.lista_presenca (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID NOT NULL REFERENCES public.alunos(id),
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT CHECK (status IN ('presente', 'ausente')),
    turno TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.lista_presenca ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Presença: consultar todos" ON public.lista_presenca;
DROP POLICY IF EXISTS "Presença: inserir qualquer" ON public.lista_presenca;
DROP POLICY IF EXISTS "Presença: editar qualquer" ON public.lista_presenca;

CREATE POLICY "Presença: consultar todos" ON public.lista_presenca FOR SELECT USING (true);
CREATE POLICY "Presença: inserir qualquer" ON public.lista_presenca FOR INSERT WITH CHECK (true);
CREATE POLICY "Presença: editar qualquer" ON public.lista_presenca FOR UPDATE USING (true);

-- ==========================================================
-- SCRIPT FINALIZADO
-- ==========================================================
