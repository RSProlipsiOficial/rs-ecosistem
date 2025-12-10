-- ================================================
-- RS PRÓLIPSI - SCHEMAS SUPABASE
-- Database: PostgreSQL via Supabase
-- Projeto: rptkhrboejbwexseikuo
-- ================================================

-- ================================================
-- 1. TABELA: users (Auth Supabase)
-- Gerenciada automaticamente pelo Supabase Auth
-- ================================================

-- ================================================
-- 2. TABELA: consultores
-- ================================================
CREATE TABLE IF NOT EXISTS consultores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Dados Pessoais
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    data_nascimento DATE,
    
    -- Endereço
    cep VARCHAR(9),
    endereco TEXT,
    numero VARCHAR(10),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    
    -- Rede MLM
    patrocinador_id UUID REFERENCES consultores(id),
    linha_direta INTEGER, -- Qual linha (1-6) no binário
    nivel_profundidade INTEGER DEFAULT 1,
    
    -- Status
    status VARCHAR(20) DEFAULT 'ativo', -- ativo, inativo, bloqueado
    data_ativacao TIMESTAMP DEFAULT NOW(),
    ultimo_ciclo TIMESTAMP,
    
    -- Contadores
    total_ciclos INTEGER DEFAULT 0,
    total_reentradas_mes INTEGER DEFAULT 0,
    mes_referencia VARCHAR(7), -- YYYY-MM
    
    -- Graduação
    pin_atual VARCHAR(50) DEFAULT 'Bronze',
    pin_nivel INTEGER DEFAULT 1,
    ciclos_acumulados_trimestre INTEGER DEFAULT 0,
    
    -- Metadados
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Índices
    INDEX idx_patrocinador (patrocinador_id),
    INDEX idx_email (email),
    INDEX idx_cpf (cpf),
    INDEX idx_status (status)
);

-- ================================================
-- 3. TABELA: cycles_history
-- ================================================
CREATE TABLE IF NOT EXISTS cycles_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultor_id UUID REFERENCES consultores(id) NOT NULL,
    
    -- Dados do Ciclo
    tipo VARCHAR(20) NOT NULL, -- 'abertura', 'fechamento', 'reentrada'
    valor_total DECIMAL(10, 2) NOT NULL, -- 360.00 ou 60.00
    valor_payout DECIMAL(10, 2), -- 108.00 se fechou
    
    -- Posições
    posicoes_preenchidas INTEGER DEFAULT 0,
    posicoes_total INTEGER DEFAULT 6,
    
    -- Status
    status VARCHAR(20) DEFAULT 'aberto', -- aberto, fechado, cancelado
    data_abertura TIMESTAMP DEFAULT NOW(),
    data_fechamento TIMESTAMP,
    
    -- Bônus Distribuídos
    bonus_profundidade DECIMAL(10, 2) DEFAULT 0.00,
    bonus_fidelidade DECIMAL(10, 2) DEFAULT 0.00,
    bonus_top_sigma DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Metadados
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Índices
    INDEX idx_consultor (consultor_id),
    INDEX idx_status (status),
    INDEX idx_data_fechamento (data_fechamento)
);

-- ================================================
-- 4. TABELA: bonuses
-- ================================================
CREATE TABLE IF NOT EXISTS bonuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultor_id UUID REFERENCES consultores(id) NOT NULL,
    origem_ciclo_id UUID REFERENCES cycles_history(id),
    
    -- Tipo de Bônus
    tipo VARCHAR(30) NOT NULL, -- 'ciclo', 'profundidade', 'fidelidade', 'top_sigma', 'carreira'
    subtipo VARCHAR(50), -- 'L1', 'L2', ... 'Top1', 'Top2', ... 'Bronze', 'Prata'
    
    -- Valores
    percentual DECIMAL(5, 2), -- ex: 30.00, 6.81
    valor DECIMAL(10, 2) NOT NULL,
    
    -- Origem
    gerado_por_consultor_id UUID REFERENCES consultores(id), -- Quem gerou este bônus
    nivel_origem INTEGER, -- L1, L2, etc
    
    -- Status
    status VARCHAR(20) DEFAULT 'pendente', -- pendente, pago, cancelado
    data_pagamento TIMESTAMP,
    
    -- Metadados
    descricao TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Índices
    INDEX idx_consultor (consultor_id),
    INDEX idx_tipo (tipo),
    INDEX idx_status (status),
    INDEX idx_origem_ciclo (origem_ciclo_id)
);

-- ================================================
-- 5. TABELA: wallets
-- ================================================
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
    consultor_id UUID REFERENCES consultores(id) UNIQUE NOT NULL,
    
    -- Saldos
    balance DECIMAL(10, 2) DEFAULT 0.00, -- Saldo disponível
    balance_pending DECIMAL(10, 2) DEFAULT 0.00, -- Saldo pendente
    balance_blocked DECIMAL(10, 2) DEFAULT 0.00, -- Saldo bloqueado
    
    -- Totais Históricos
    total_received DECIMAL(10, 2) DEFAULT 0.00,
    total_withdrawn DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Status
    status VARCHAR(20) DEFAULT 'ativa', -- ativa, bloqueada, suspensa
    
    -- Metadados
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Índices
    INDEX idx_user (user_id),
    INDEX idx_consultor (consultor_id),
    INDEX idx_status (status)
);

-- ================================================
-- 6. TABELA: transactions
-- ================================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES wallets(id) NOT NULL,
    consultor_id UUID REFERENCES consultores(id) NOT NULL,
    
    -- Transação
    tipo VARCHAR(30) NOT NULL, -- 'bonus', 'pagamento', 'reentrada', 'saque', 'estorno'
    valor DECIMAL(10, 2) NOT NULL,
    
    -- Origem/Destino
    origem_bonus_id UUID REFERENCES bonuses(id),
    origem_ciclo_id UUID REFERENCES cycles_history(id),
    
    -- Saldos (snapshot)
    balance_before DECIMAL(10, 2),
    balance_after DECIMAL(10, 2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'completed', -- pending, completed, failed, cancelled
    
    -- Metadados
    descricao TEXT,
    metadata JSONB, -- Dados adicionais flexíveis
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Índices
    INDEX idx_wallet (wallet_id),
    INDEX idx_consultor (consultor_id),
    INDEX idx_tipo (tipo),
    INDEX idx_created_at (created_at)
);

-- ================================================
-- 7. TABELA: ranking
-- ================================================
CREATE TABLE IF NOT EXISTS ranking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultor_id UUID REFERENCES consultores(id) UNIQUE NOT NULL,
    
    -- Período
    periodo_tipo VARCHAR(20) NOT NULL, -- 'mensal', 'trimestral', 'anual'
    periodo_referencia VARCHAR(10) NOT NULL, -- '2025-11', '2025-Q4'
    
    -- Métricas
    total_ciclos INTEGER DEFAULT 0,
    total_volume DECIMAL(10, 2) DEFAULT 0.00,
    total_downlines INTEGER DEFAULT 0,
    total_diretos INTEGER DEFAULT 0,
    
    -- Ranking
    posicao INTEGER,
    pontos DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Metadados
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Índices
    INDEX idx_consultor (consultor_id),
    INDEX idx_periodo (periodo_tipo, periodo_referencia),
    INDEX idx_posicao (posicao)
);

-- ================================================
-- 8. TABELA: downlines (Estrutura de Rede)
-- ================================================
CREATE TABLE IF NOT EXISTS downlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upline_id UUID REFERENCES consultores(id) NOT NULL,
    downline_id UUID REFERENCES consultores(id) NOT NULL,
    
    -- Hierarquia
    nivel INTEGER NOT NULL, -- 1 = direto, 2-6 = indireto
    linha INTEGER, -- Linha do binário (1-6 ou null)
    caminho TEXT, -- Path completo: upline1 > upline2 > upline3
    
    -- Status
    ativo BOOLEAN DEFAULT true,
    
    -- Metadados
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(upline_id, downline_id),
    
    -- Índices
    INDEX idx_upline (upline_id),
    INDEX idx_downline (downline_id),
    INDEX idx_nivel (nivel)
);

-- ================================================
-- 9. TABELA: logs_operations
-- ================================================
CREATE TABLE IF NOT EXISTS logs_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Evento
    evento VARCHAR(100) NOT NULL,
    tipo VARCHAR(50), -- 'info', 'warning', 'error', 'critical'
    
    -- Dados
    consultor_id UUID REFERENCES consultores(id),
    payload JSONB,
    
    -- Contexto
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Índices
    INDEX idx_evento (evento),
    INDEX idx_tipo (tipo),
    INDEX idx_consultor (consultor_id),
    INDEX idx_created_at (created_at)
);

-- ================================================
-- 10. FUNÇÕES E TRIGGERS
-- ================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para consultores
CREATE TRIGGER update_consultores_updated_at BEFORE UPDATE ON consultores
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para wallets
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- 11. POLÍTICAS RLS (Row Level Security)
-- ================================================

-- Habilitar RLS
ALTER TABLE consultores ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Política: Usuário pode ver apenas seus próprios dados
CREATE POLICY "Usuários veem apenas próprios dados" ON consultores
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários veem apenas própria carteira" ON wallets
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários veem apenas próprias transações" ON transactions
FOR SELECT USING (consultor_id IN (SELECT id FROM consultores WHERE user_id = auth.uid()));

-- ================================================
-- 12. DADOS INICIAIS (SEED)
-- ================================================

-- Consultor Admin Inicial
-- NOTA: Primeiro criar usuário via Supabase Auth, depois pegar o UUID
-- INSERT INTO consultores (user_id, nome, email, cpf, status, pin_atual)
-- VALUES ('UUID-DO-AUTH-USER', 'Admin RS Prólipsi', 'rsprolipsioficial@gmail.com', '00000000000', 'ativo', 'Diamante Black');

-- ================================================
-- FIM DOS SCHEMAS
-- ================================================

-- Para verificar todas as tabelas criadas:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
