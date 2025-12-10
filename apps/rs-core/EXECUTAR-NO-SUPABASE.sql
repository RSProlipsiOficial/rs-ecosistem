-- ================================================
-- RS PRÓLIPSI - SQL COMPLETO PARA SUPABASE
-- Execute este arquivo COMPLETO no SQL Editor
-- ================================================
-- Projeto: rptkhrboejbwexseikuo
-- URL: https://rptkhrboejbwexseikuo.supabase.co
-- ================================================

-- ================================================
-- PARTE 1: TABELAS BASE
-- ================================================

-- 1. consultores
CREATE TABLE IF NOT EXISTS consultores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    data_nascimento DATE,
    cep VARCHAR(9),
    endereco TEXT,
    numero VARCHAR(10),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    patrocinador_id UUID REFERENCES consultores(id),
    linha_direta INTEGER,
    nivel_profundidade INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'ativo',
    data_ativacao TIMESTAMP DEFAULT NOW(),
    ultimo_ciclo TIMESTAMP,
    total_ciclos INTEGER DEFAULT 0,
    total_reentradas_mes INTEGER DEFAULT 0,
    mes_referencia VARCHAR(7),
    pin_atual VARCHAR(50) DEFAULT 'Bronze',
    pin_nivel INTEGER DEFAULT 1,
    ciclos_acumulados_trimestre INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_consultores_patrocinador ON consultores(patrocinador_id);
CREATE INDEX IF NOT EXISTS idx_consultores_email ON consultores(email);
CREATE INDEX IF NOT EXISTS idx_consultores_cpf ON consultores(cpf);
CREATE INDEX IF NOT EXISTS idx_consultores_status ON consultores(status);

-- 2. wallets
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
    consultor_id UUID REFERENCES consultores(id) UNIQUE NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    balance_pending DECIMAL(10, 2) DEFAULT 0.00,
    balance_blocked DECIMAL(10, 2) DEFAULT 0.00,
    total_received DECIMAL(10, 2) DEFAULT 0.00,
    total_withdrawn DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'ativa',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_consultor ON wallets(consultor_id);

-- 3. product_catalog
CREATE TABLE IF NOT EXISTS product_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE,
    price_base DECIMAL(10, 2) NOT NULL DEFAULT 120.00,
    price_consultor DECIMAL(10, 2) NOT NULL DEFAULT 60.00,
    price_cd DECIMAL(10, 2) NOT NULL DEFAULT 50.88,
    discount_consultor DECIMAL(5, 2) DEFAULT 50.00,
    discount_cd DECIMAL(5, 2) DEFAULT 57.60,
    contributes_to_matrix BOOLEAN DEFAULT true,
    matrix_cycle_value INTEGER DEFAULT 1,
    points_per_cycle INTEGER DEFAULT 1,
    stock_quantity INTEGER DEFAULT 0,
    stock_alert_threshold INTEGER DEFAULT 10,
    status VARCHAR(20) DEFAULT 'active',
    is_featured BOOLEAN DEFAULT false,
    category VARCHAR(100),
    tags TEXT[],
    image_url TEXT,
    gallery_urls TEXT[],
    slug VARCHAR(255) UNIQUE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);
CREATE INDEX IF NOT EXISTS idx_products_status ON product_catalog(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON product_catalog(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON product_catalog(slug);

-- 4. matriz_cycles
CREATE TABLE IF NOT EXISTS matriz_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultor_id UUID REFERENCES consultores(id) NOT NULL,
    cycle_number INTEGER NOT NULL,
    matrix_type VARCHAR(20) DEFAULT 'SIGMA_1x6',
    slot_1_sale_id UUID,
    slot_2_sale_id UUID,
    slot_3_sale_id UUID,
    slot_4_sale_id UUID,
    slot_5_sale_id UUID,
    slot_6_sale_id UUID,
    slots_filled INTEGER DEFAULT 0,
    slots_total INTEGER DEFAULT 6,
    status VARCHAR(20) DEFAULT 'open',
    cycle_value_total DECIMAL(10, 2) DEFAULT 360.00,
    cycle_payout DECIMAL(10, 2) DEFAULT 108.00,
    opened_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    reentry_triggered BOOLEAN DEFAULT false,
    reentry_cycle_id UUID REFERENCES matriz_cycles(id),
    career_point_awarded BOOLEAN DEFAULT false,
    career_point_date TIMESTAMP,
    bonus_profundidade_distributed BOOLEAN DEFAULT false,
    bonus_fidelidade_accrued BOOLEAN DEFAULT false,
    bonus_top_sigma_eligible BOOLEAN DEFAULT false,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(consultor_id, cycle_number)
);
CREATE INDEX IF NOT EXISTS idx_cycles_consultor ON matriz_cycles(consultor_id);
CREATE INDEX IF NOT EXISTS idx_cycles_status ON matriz_cycles(status);
CREATE INDEX IF NOT EXISTS idx_cycles_completed ON matriz_cycles(completed_at);

-- 5. sales
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES consultores(id) NOT NULL,
    buyer_type VARCHAR(20) NOT NULL,
    product_id UUID REFERENCES product_catalog(id) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    price_original DECIMAL(10, 2) NOT NULL,
    discount_applied DECIMAL(5, 2) DEFAULT 0.00,
    price_final DECIMAL(10, 2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL,
    contributes_to_matrix BOOLEAN DEFAULT true,
    matrix_id UUID REFERENCES matriz_cycles(id),
    matrix_slot_filled INTEGER,
    career_points_generated INTEGER DEFAULT 0,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_id UUID,
    paid_at TIMESTAMP,
    shipping_address JSONB,
    tracking_code VARCHAR(100),
    delivery_status VARCHAR(20) DEFAULT 'pending',
    delivered_at TIMESTAMP,
    seller_id UUID REFERENCES consultores(id),
    commission_paid BOOLEAN DEFAULT false,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sales_buyer ON sales(buyer_id);
CREATE INDEX IF NOT EXISTS idx_sales_product ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_matrix ON sales(matrix_id);
CREATE INDEX IF NOT EXISTS idx_sales_payment ON sales(payment_status);
CREATE INDEX IF NOT EXISTS idx_sales_delivery ON sales(delivery_status);
CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at);

-- 6. career_points
CREATE TABLE IF NOT EXISTS career_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultor_id UUID REFERENCES consultores(id) UNIQUE NOT NULL,
    points_total INTEGER DEFAULT 0,
    points_trimestre_atual INTEGER DEFAULT 0,
    trimestre_referencia VARCHAR(10),
    pin_atual VARCHAR(50) DEFAULT 'Bronze',
    pin_nivel INTEGER DEFAULT 1,
    total_cycles_completed INTEGER DEFAULT 0,
    last_cycle_date TIMESTAMP,
    vme_linha_1_percent DECIMAL(5, 2) DEFAULT 0.00,
    vme_linha_2_percent DECIMAL(5, 2) DEFAULT 0.00,
    vme_linha_3_percent DECIMAL(5, 2) DEFAULT 0.00,
    vme_linha_4_percent DECIMAL(5, 2) DEFAULT 0.00,
    vme_linha_5_percent DECIMAL(5, 2) DEFAULT 0.00,
    vme_linha_6_percent DECIMAL(5, 2) DEFAULT 0.00,
    next_pin VARCHAR(50),
    points_needed_for_next INTEGER,
    progress_percent DECIMAL(5, 2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_career_consultor ON career_points(consultor_id);
CREATE INDEX IF NOT EXISTS idx_career_pin ON career_points(pin_nivel);
CREATE INDEX IF NOT EXISTS idx_career_points ON career_points(points_total);

-- 7. user_roles
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
    consultor_id UUID REFERENCES consultores(id) UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'cliente',
    can_buy BOOLEAN DEFAULT true,
    can_sell BOOLEAN DEFAULT false,
    can_recruit BOOLEAN DEFAULT false,
    can_view_reports BOOLEAN DEFAULT false,
    can_manage_products BOOLEAN DEFAULT false,
    can_manage_users BOOLEAN DEFAULT false,
    is_cd BOOLEAN DEFAULT false,
    cd_code VARCHAR(50) UNIQUE,
    cd_region VARCHAR(100),
    cd_discount_level DECIMAL(5, 2) DEFAULT 57.60,
    status VARCHAR(20) DEFAULT 'active',
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_roles_cd ON user_roles(is_cd);

-- 8. bonuses
CREATE TABLE IF NOT EXISTS bonuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultor_id UUID REFERENCES consultores(id) NOT NULL,
    origem_ciclo_id UUID REFERENCES matriz_cycles(id),
    tipo VARCHAR(30) NOT NULL,
    subtipo VARCHAR(50),
    percentual DECIMAL(5, 2),
    valor DECIMAL(10, 2) NOT NULL,
    gerado_por_consultor_id UUID REFERENCES consultores(id),
    nivel_origem INTEGER,
    status VARCHAR(20) DEFAULT 'pendente',
    data_pagamento TIMESTAMP,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bonuses_consultor ON bonuses(consultor_id);
CREATE INDEX IF NOT EXISTS idx_bonuses_tipo ON bonuses(tipo);
CREATE INDEX IF NOT EXISTS idx_bonuses_status ON bonuses(status);
CREATE INDEX IF NOT EXISTS idx_bonuses_ciclo ON bonuses(origem_ciclo_id);

-- 9. transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES wallets(id) NOT NULL,
    consultor_id UUID REFERENCES consultores(id) NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    origem_bonus_id UUID REFERENCES bonuses(id),
    origem_ciclo_id UUID REFERENCES matriz_cycles(id),
    balance_before DECIMAL(10, 2),
    balance_after DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'completed',
    descricao TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_trans_wallet ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_trans_consultor ON transactions(consultor_id);
CREATE INDEX IF NOT EXISTS idx_trans_tipo ON transactions(tipo);
CREATE INDEX IF NOT EXISTS idx_trans_created ON transactions(created_at);

-- 10. ranking
CREATE TABLE IF NOT EXISTS ranking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultor_id UUID REFERENCES consultores(id) UNIQUE NOT NULL,
    periodo_tipo VARCHAR(20) NOT NULL,
    periodo_referencia VARCHAR(10) NOT NULL,
    total_ciclos INTEGER DEFAULT 0,
    total_volume DECIMAL(10, 2) DEFAULT 0.00,
    total_downlines INTEGER DEFAULT 0,
    total_diretos INTEGER DEFAULT 0,
    posicao INTEGER,
    pontos DECIMAL(10, 2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ranking_consultor ON ranking(consultor_id);
CREATE INDEX IF NOT EXISTS idx_ranking_periodo ON ranking(periodo_tipo, periodo_referencia);
CREATE INDEX IF NOT EXISTS idx_ranking_posicao ON ranking(posicao);

-- 11. downlines
CREATE TABLE IF NOT EXISTS downlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upline_id UUID REFERENCES consultores(id) NOT NULL,
    downline_id UUID REFERENCES consultores(id) NOT NULL,
    nivel INTEGER NOT NULL,
    linha INTEGER,
    caminho TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(upline_id, downline_id)
);
CREATE INDEX IF NOT EXISTS idx_downlines_upline ON downlines(upline_id);
CREATE INDEX IF NOT EXISTS idx_downlines_downline ON downlines(downline_id);
CREATE INDEX IF NOT EXISTS idx_downlines_nivel ON downlines(nivel);

-- 12. cycle_events
CREATE TABLE IF NOT EXISTS cycle_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID REFERENCES matriz_cycles(id) NOT NULL,
    consultor_id UUID REFERENCES consultores(id) NOT NULL,
    sale_id UUID REFERENCES sales(id),
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    value_before DECIMAL(10, 2),
    value_after DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_cycle ON cycle_events(cycle_id);
CREATE INDEX IF NOT EXISTS idx_events_consultor ON cycle_events(consultor_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON cycle_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created ON cycle_events(created_at);

-- 13. logs_operations
CREATE TABLE IF NOT EXISTS logs_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento VARCHAR(100) NOT NULL,
    tipo VARCHAR(50),
    consultor_id UUID REFERENCES consultores(id),
    payload JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_logs_evento ON logs_operations(evento);
CREATE INDEX IF NOT EXISTS idx_logs_tipo ON logs_operations(tipo);
CREATE INDEX IF NOT EXISTS idx_logs_consultor ON logs_operations(consultor_id);
CREATE INDEX IF NOT EXISTS idx_logs_created ON logs_operations(created_at);

-- ================================================
-- PARTE 2: FUNÇÕES E TRIGGERS
-- ================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers
CREATE TRIGGER update_consultores_updated_at BEFORE UPDATE ON consultores
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_catalog_updated_at BEFORE UPDATE ON product_catalog
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matriz_cycles_updated_at BEFORE UPDATE ON matriz_cycles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- PARTE 3: ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE consultores ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriz_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "consultores_view_own" ON consultores
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "wallets_view_own" ON wallets
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "products_public_active" ON product_catalog
FOR SELECT USING (status = 'active');

CREATE POLICY "sales_view_own" ON sales
FOR SELECT USING (buyer_id IN (SELECT id FROM consultores WHERE user_id = auth.uid()));

CREATE POLICY "cycles_view_own" ON matriz_cycles
FOR SELECT USING (consultor_id IN (SELECT id FROM consultores WHERE user_id = auth.uid()));

CREATE POLICY "career_view_own" ON career_points
FOR SELECT USING (consultor_id IN (SELECT id FROM consultores WHERE user_id = auth.uid()));

CREATE POLICY "transactions_view_own" ON transactions
FOR SELECT USING (consultor_id IN (SELECT id FROM consultores WHERE user_id = auth.uid()));

-- ================================================
-- PARTE 4: DADOS INICIAIS (SEED)
-- ================================================

-- Produto: Kit de Ativação SIGMA
INSERT INTO product_catalog (
    name, description, sku,
    price_base, price_consultor, price_cd,
    discount_consultor, discount_cd,
    category, status, is_featured, slug,
    meta_title, meta_description
) VALUES (
    'Kit de Ativação SIGMA 1x6',
    'Kit completo para ativação na matriz SIGMA. Inclui acesso ao sistema, materiais de treinamento e suporte completo.',
    'KIT-SIGMA-1X6',
    120.00, 60.00, 50.88,
    50.00, 57.60,
    'Ativação', 'active', true, 'kit-ativacao-sigma-1x6',
    'Kit de Ativação SIGMA 1x6 - RS Prólipsi',
    'Kit completo para iniciar na matriz SIGMA. Valor especial para consultores ativos.'
) ON CONFLICT (sku) DO NOTHING;

-- ================================================
-- FIM - EXECUTE TUDO DE UMA VEZ
-- ================================================

-- Verificar tabelas criadas:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
