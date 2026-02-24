-- Tabela de comunicados para os responsáveis
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

-- Tabela para rastrear quais responsáveis leram quais comunicados
CREATE TABLE IF NOT EXISTS comunicados_lidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comunicado_id UUID NOT NULL REFERENCES comunicados(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lido_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comunicado_id, user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_comunicados_owner ON comunicados(owner_id);
CREATE INDEX IF NOT EXISTS idx_comunicados_data ON comunicados(data_publicacao DESC);
CREATE INDEX IF NOT EXISTS idx_comunicados_ativo ON comunicados(ativo);
CREATE INDEX IF NOT EXISTS idx_comunicados_lidos_user ON comunicados_lidos(user_id);

-- RLS Policies
ALTER TABLE comunicados ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicados_lidos ENABLE ROW LEVEL SECURITY;

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

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_comunicados_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comunicados_updated_at
    BEFORE UPDATE ON comunicados
    FOR EACH ROW
    EXECUTE FUNCTION update_comunicados_updated_at();
