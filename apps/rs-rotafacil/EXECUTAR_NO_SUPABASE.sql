-- ================================================================
-- MIGRATION: Criar Tabelas de Comunicados
-- Data: 2026-01-14
-- ================================================================
-- INSTRUÇÃO: Copie todo este conteúdo e cole no SQL Editor do Supabase
-- (Acesse: Dashboard > SQL Editor > New Query > Cole e Execute)
-- ================================================================

-- 1. Criar tabela de comunicados
CREATE TABLE IF NOT EXISTS comunicados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('EVENTO', 'AVISO', 'SISTEMA')),
    data_publicacao DATE NOT NULL,
    van_id UUID REFERENCES vans(id) ON DELETE SET NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de comunicados lidos
CREATE TABLE IF NOT EXISTS comunicados_lidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comunicado_id UUID NOT NULL REFERENCES comunicados(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lido_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comunicado_id, user_id)
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_comunicados_owner ON comunicados(owner_id);
CREATE INDEX IF NOT EXISTS idx_comunicados_data ON comunicados(data_publicacao DESC);
CREATE INDEX IF NOT EXISTS idx_comunicados_ativo ON comunicados(ativo);
CREATE INDEX IF NOT EXISTS idx_comunicados_lidos_user ON comunicados_lidos(user_id);

-- 4. Habilitar RLS
ALTER TABLE comunicados ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicados_lidos ENABLE ROW LEVEL SECURITY;

-- 5. Remover policies antigas se existirem
DROP POLICY IF EXISTS "Owners can manage their comunicados" ON comunicados;
DROP POLICY IF EXISTS "Responsaveis can view their owner's comunicados" ON comunicados;
DROP POLICY IF EXISTS "Users can mark comunicados as read" ON comunicados_lidos;
DROP POLICY IF EXISTS "Users can view their read status" ON comunicados_lidos;

-- 6. Criar RLS Policies
-- Donos podem ver e gerenciar seus próprios comunicados
CREATE POLICY "Owners can manage their comunicados"
    ON comunicados
    FOR ALL
    USING (owner_id = auth.uid());

-- Responsáveis podem ver comunicados do seu dono (sponsor)
CREATE POLICY "Responsaveis can view their owner's comunicados"
    ON comunicados
    FOR SELECT
    USING (
        owner_id IN (
            SELECT sponsor_id 
            FROM user_profiles 
            WHERE user_id = auth.uid()
        )
        AND ativo = true
    );

-- Qualquer usuário autenticado pode marcar como lido
CREATE POLICY "Users can mark comunicados as read"
    ON comunicados_lidos
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Usuários podem ver seus próprios registros de leitura
CREATE POLICY "Users can view their read status"
    ON comunicados_lidos
    FOR SELECT
    USING (user_id = auth.uid());

-- 7. Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_comunicados_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS comunicados_updated_at ON comunicados;

CREATE TRIGGER comunicados_updated_at
    BEFORE UPDATE ON comunicados
    FOR EACH ROW
    EXECUTE FUNCTION update_comunicados_updated_at();

-- ================================================================
-- FIM DA MIGRATION
-- ================================================================
-- Após executar, você deverá ver mensagem de sucesso
-- Agora precisa regenerar os tipos TypeScript rodando:
-- npx supabase gen types typescript --local > src/integrations/supabase/types.ts
-- OU se estiver em produção:
-- npx supabase gen types typescript --project-id [seu-project-id] > src/integrations/supabase/types.ts
-- ================================================================
