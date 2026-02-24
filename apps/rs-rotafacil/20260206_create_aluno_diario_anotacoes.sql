
-- Tabela para anotações diárias dos alunos (Monitoramento)
-- Reseta "logicamente" porque a consulta será feita por DATA.
-- Dados antigos permanecem para histórico se necessário.

CREATE TABLE IF NOT EXISTS public.aluno_diario_anotacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    conteudo TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id), -- Quem criou a anotação
    
    -- Garante apenas uma anotação por aluno por dia (pode ser editada)
    UNIQUE(aluno_id, data)
);

-- RLS Policies
ALTER TABLE public.aluno_diario_anotacoes ENABLE ROW LEVEL SECURITY;

-- Permitir tudo para usuários autenticados (Simplificação para agilidade, idealmente filtrar por dono/van)
CREATE POLICY "Acesso total para autenticados" ON public.aluno_diario_anotacoes
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Index para performance na busca por data
CREATE INDEX IF NOT EXISTS idx_aluno_diario_anotacoes_data ON public.aluno_diario_anotacoes(data);
