-- ================================================
-- RS PRÓLIPSI - TABELAS PRODUTOS E MATRIZ
-- Lógica completa de vendas, ciclos e pontuação
-- ================================================

-- ================================================
-- 1. TABELA: product_catalog
-- ================================================
CREATE TABLE IF NOT EXISTS product_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Dados do Produto
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE,
    
    -- Precificação Base
    price_base DECIMAL(10, 2) NOT NULL DEFAULT 120.00, -- Preço de vitrine
    price_consultor DECIMAL(10, 2) NOT NULL DEFAULT 60.00, -- 50% desconto
    price_cd DECIMAL(10, 2) NOT NULL DEFAULT 50.88, -- 50% + 15.2%
    
    -- Descontos (%)
    discount_consultor DECIMAL(5, 2) DEFAULT 50.00, -- 50%
    discount_cd DECIMAL(5, 2) DEFAULT 57.60, -- 50% + 15.2% = 57.6%
    
    -- Matriz
    contributes_to_matrix BOOLEAN DEFAULT true,
    matrix_cycle_value INTEGER DEFAULT 1, -- 1 vaga por venda
    points_per_cycle INTEGER DEFAULT 1, -- 1 ponto ao ciclar
    
    -- Estoque
    stock_quantity INTEGER DEFAULT 0,
    stock_alert_threshold INTEGER DEFAULT 10,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, discontinued
    is_featured BOOLEAN DEFAULT false,
    
    -- Categoria
    category VARCHAR(100),
    tags TEXT[], -- Array de tags
    
    -- Imagens
    image_url TEXT,
    gallery_urls TEXT[], -- Array de URLs
    
    -- SEO
    slug VARCHAR(255) UNIQUE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Metadados
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Índices
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_slug (slug),
    INDEX idx_sku (sku)
);

-- ================================================
-- 2. TABELA: sales
-- ================================================
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Comprador
    buyer_id UUID REFERENCES consultores(id) NOT NULL,
    buyer_type VARCHAR(20) NOT NULL, -- 'cliente', 'consultor', 'cd'
    
    -- Produto
    product_id UUID REFERENCES product_catalog(id) NOT NULL,
    product_name VARCHAR(255) NOT NULL, -- Snapshot
    product_sku VARCHAR(100),
    
    -- Valores
    price_original DECIMAL(10, 2) NOT NULL, -- Preço base
    discount_applied DECIMAL(5, 2) DEFAULT 0.00, -- % desconto
    price_final DECIMAL(10, 2) NOT NULL, -- Valor pago
    
    -- Quantidade
    quantity INTEGER DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL, -- price_final * quantity
    
    -- Matriz
    contributes_to_matrix BOOLEAN DEFAULT true,
    matrix_id UUID REFERENCES matriz_cycles(id), -- Ciclo que recebeu a venda
    matrix_slot_filled INTEGER, -- Qual vaga preencheu (1-6)
    
    -- Pontuação
    career_points_generated INTEGER DEFAULT 0, -- Se ciclou, gera 1 ponto
    
    -- Pagamento
    payment_method VARCHAR(50), -- 'wallet', 'pix', 'card', 'boleto'
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
    payment_id UUID, -- ID externo (Asaas, etc)
    paid_at TIMESTAMP,
    
    -- Entrega
    shipping_address JSONB,
    tracking_code VARCHAR(100),
    delivery_status VARCHAR(20) DEFAULT 'pending', -- pending, shipped, delivered, cancelled
    delivered_at TIMESTAMP,
    
    -- Vendedor/Patrocinador
    seller_id UUID REFERENCES consultores(id), -- Quem indicou/vendeu
    commission_paid BOOLEAN DEFAULT false,
    
    -- Metadados
    notes TEXT,
    metadata JSONB, -- Dados flexíveis
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Índices
    INDEX idx_buyer (buyer_id),
    INDEX idx_product (product_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_delivery_status (delivery_status),
    INDEX idx_matrix (matrix_id),
    INDEX idx_seller (seller_id),
    INDEX idx_created_at (created_at)
);

-- ================================================
-- 3. TABELA: matriz_cycles (Controle de Ciclos)
-- ================================================
CREATE TABLE IF NOT EXISTS matriz_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Consultor
    consultor_id UUID REFERENCES consultores(id) NOT NULL,
    
    -- Ciclo
    cycle_number INTEGER NOT NULL, -- 1, 2, 3...
    matrix_type VARCHAR(20) DEFAULT 'SIGMA_1x6',
    
    -- Vagas (1-6)
    slot_1_sale_id UUID REFERENCES sales(id),
    slot_2_sale_id UUID REFERENCES sales(id),
    slot_3_sale_id UUID REFERENCES sales(id),
    slot_4_sale_id UUID REFERENCES sales(id),
    slot_5_sale_id UUID REFERENCES sales(id),
    slot_6_sale_id UUID REFERENCES sales(id),
    
    -- Contadores
    slots_filled INTEGER DEFAULT 0, -- 0-6
    slots_total INTEGER DEFAULT 6,
    
    -- Status
    status VARCHAR(20) DEFAULT 'open', -- open, completed, cancelled
    
    -- Valores
    cycle_value_total DECIMAL(10, 2) DEFAULT 360.00, -- 6 x 60
    cycle_payout DECIMAL(10, 2) DEFAULT 108.00, -- 30%
    
    -- Datas
    opened_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    
    -- Reentrada
    reentry_triggered BOOLEAN DEFAULT false,
    reentry_cycle_id UUID REFERENCES matriz_cycles(id), -- Novo ciclo gerado
    
    -- Pontos
    career_point_awarded BOOLEAN DEFAULT false,
    career_point_date TIMESTAMP,
    
    -- Bônus Gerados
    bonus_profundidade_distributed BOOLEAN DEFAULT false,
    bonus_fidelidade_accrued BOOLEAN DEFAULT false,
    bonus_top_sigma_eligible BOOLEAN DEFAULT false,
    
    -- Metadados
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(consultor_id, cycle_number),
    
    -- Índices
    INDEX idx_consultor (consultor_id),
    INDEX idx_status (status),
    INDEX idx_cycle_number (cycle_number),
    INDEX idx_completed_at (completed_at)
);

-- ================================================
-- 4. TABELA: career_points
-- ================================================
CREATE TABLE IF NOT EXISTS career_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Consultor
    consultor_id UUID REFERENCES consultores(id) UNIQUE NOT NULL,
    
    -- Pontos Acumulados
    points_total INTEGER DEFAULT 0,
    points_trimestre_atual INTEGER DEFAULT 0,
    trimestre_referencia VARCHAR(10), -- '2025-Q4'
    
    -- Graduação Atual
    pin_atual VARCHAR(50) DEFAULT 'Bronze',
    pin_nivel INTEGER DEFAULT 1,
    
    -- Histórico de Ciclos
    total_cycles_completed INTEGER DEFAULT 0,
    last_cycle_date TIMESTAMP,
    
    -- VME (Volume Máximo por Equipe)
    vme_linha_1_percent DECIMAL(5, 2) DEFAULT 0.00,
    vme_linha_2_percent DECIMAL(5, 2) DEFAULT 0.00,
    vme_linha_3_percent DECIMAL(5, 2) DEFAULT 0.00,
    vme_linha_4_percent DECIMAL(5, 2) DEFAULT 0.00,
    vme_linha_5_percent DECIMAL(5, 2) DEFAULT 0.00,
    vme_linha_6_percent DECIMAL(5, 2) DEFAULT 0.00,
    
    -- Próxima Graduação
    next_pin VARCHAR(50),
    points_needed_for_next INTEGER,
    progress_percent DECIMAL(5, 2) DEFAULT 0.00,
    
    -- Metadados
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Índices
    INDEX idx_consultor (consultor_id),
    INDEX idx_pin_nivel (pin_nivel),
    INDEX idx_points_total (points_total)
);

-- ================================================
-- 5. TABELA: user_roles (Permissões)
-- ================================================
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
    consultor_id UUID REFERENCES consultores(id) UNIQUE,
    
    -- Tipo de Usuário
    role VARCHAR(20) NOT NULL DEFAULT 'cliente', -- cliente, consultor, cd, admin, super_admin
    
    -- Permissões
    can_buy BOOLEAN DEFAULT true,
    can_sell BOOLEAN DEFAULT false,
    can_recruit BOOLEAN DEFAULT false,
    can_view_reports BOOLEAN DEFAULT false,
    can_manage_products BOOLEAN DEFAULT false,
    can_manage_users BOOLEAN DEFAULT false,
    
    -- CD (Centro de Distribuição)
    is_cd BOOLEAN DEFAULT false,
    cd_code VARCHAR(50) UNIQUE,
    cd_region VARCHAR(100),
    cd_discount_level DECIMAL(5, 2) DEFAULT 57.60, -- 50% + 15.2%
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
    verified BOOLEAN DEFAULT false,
    
    -- Metadados
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Índices
    INDEX idx_user (user_id),
    INDEX idx_role (role),
    INDEX idx_is_cd (is_cd),
    INDEX idx_status (status)
);

-- ================================================
-- 6. TABELA: cycle_events (Log de Eventos)
-- ================================================
CREATE TABLE IF NOT EXISTS cycle_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Referências
    cycle_id UUID REFERENCES matriz_cycles(id) NOT NULL,
    consultor_id UUID REFERENCES consultores(id) NOT NULL,
    sale_id UUID REFERENCES sales(id),
    
    -- Evento
    event_type VARCHAR(50) NOT NULL, -- 'slot_filled', 'cycle_completed', 'reentry_triggered', 'bonus_distributed', 'point_awarded'
    event_data JSONB,
    
    -- Valores (se aplicável)
    value_before DECIMAL(10, 2),
    value_after DECIMAL(10, 2),
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Índices
    INDEX idx_cycle (cycle_id),
    INDEX idx_consultor (consultor_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at)
);

-- ================================================
-- 7. FUNÇÕES E TRIGGERS
-- ================================================

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_product_catalog_updated_at BEFORE UPDATE ON product_catalog
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matriz_cycles_updated_at BEFORE UPDATE ON matriz_cycles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- 8. FUNÇÃO: Processar Venda e Atualizar Ciclo
-- ================================================
CREATE OR REPLACE FUNCTION process_sale_and_cycle(
    p_buyer_id UUID,
    p_product_id UUID,
    p_price_final DECIMAL(10, 2),
    p_quantity INTEGER DEFAULT 1
)
RETURNS UUID AS $$
DECLARE
    v_sale_id UUID;
    v_cycle_id UUID;
    v_slots_filled INTEGER;
    v_next_slot INTEGER;
    v_cycle_completed BOOLEAN := false;
BEGIN
    -- 1. Criar registro de venda
    INSERT INTO sales (
        buyer_id,
        buyer_type,
        product_id,
        product_name,
        price_final,
        quantity,
        total_amount,
        payment_status
    )
    SELECT
        p_buyer_id,
        CASE 
            WHEN ur.role = 'cd' THEN 'cd'
            WHEN ur.role = 'consultor' THEN 'consultor'
            ELSE 'cliente'
        END,
        p_product_id,
        pc.name,
        p_price_final,
        p_quantity,
        p_price_final * p_quantity,
        'completed'
    FROM product_catalog pc
    LEFT JOIN user_roles ur ON ur.consultor_id = (SELECT id FROM consultores WHERE user_id = auth.uid())
    WHERE pc.id = p_product_id
    RETURNING id INTO v_sale_id;
    
    -- 2. Buscar ou criar ciclo aberto
    SELECT id, slots_filled
    INTO v_cycle_id, v_slots_filled
    FROM matriz_cycles
    WHERE consultor_id = p_buyer_id
      AND status = 'open'
    ORDER BY opened_at DESC
    LIMIT 1;
    
    -- Se não existe ciclo aberto, criar novo
    IF v_cycle_id IS NULL THEN
        INSERT INTO matriz_cycles (
            consultor_id,
            cycle_number,
            status
        )
        SELECT
            p_buyer_id,
            COALESCE(MAX(cycle_number), 0) + 1,
            'open'
        FROM matriz_cycles
        WHERE consultor_id = p_buyer_id
        RETURNING id, slots_filled INTO v_cycle_id, v_slots_filled;
    END IF;
    
    -- 3. Preencher próximo slot disponível
    v_next_slot := v_slots_filled + 1;
    
    UPDATE matriz_cycles
    SET
        slot_1_sale_id = CASE WHEN v_next_slot = 1 THEN v_sale_id ELSE slot_1_sale_id END,
        slot_2_sale_id = CASE WHEN v_next_slot = 2 THEN v_sale_id ELSE slot_2_sale_id END,
        slot_3_sale_id = CASE WHEN v_next_slot = 3 THEN v_sale_id ELSE slot_3_sale_id END,
        slot_4_sale_id = CASE WHEN v_next_slot = 4 THEN v_sale_id ELSE slot_4_sale_id END,
        slot_5_sale_id = CASE WHEN v_next_slot = 5 THEN v_sale_id ELSE slot_5_sale_id END,
        slot_6_sale_id = CASE WHEN v_next_slot = 6 THEN v_sale_id ELSE slot_6_sale_id END,
        slots_filled = v_next_slot,
        status = CASE WHEN v_next_slot = 6 THEN 'completed' ELSE 'open' END,
        completed_at = CASE WHEN v_next_slot = 6 THEN NOW() ELSE NULL END
    WHERE id = v_cycle_id;
    
    -- 4. Se ciclo completou (6 vendas)
    IF v_next_slot = 6 THEN
        -- Marcar ponto de carreira
        UPDATE matriz_cycles
        SET career_point_awarded = true,
            career_point_date = NOW()
        WHERE id = v_cycle_id;
        
        -- Atualizar pontos do consultor
        INSERT INTO career_points (consultor_id, points_total, points_trimestre_atual, total_cycles_completed)
        VALUES (p_buyer_id, 1, 1, 1)
        ON CONFLICT (consultor_id) DO UPDATE
        SET points_total = career_points.points_total + 1,
            points_trimestre_atual = career_points.points_trimestre_atual + 1,
            total_cycles_completed = career_points.total_cycles_completed + 1,
            last_cycle_date = NOW();
        
        -- Registrar evento
        INSERT INTO cycle_events (cycle_id, consultor_id, event_type, event_data)
        VALUES (v_cycle_id, p_buyer_id, 'cycle_completed', jsonb_build_object(
            'cycle_number', (SELECT cycle_number FROM matriz_cycles WHERE id = v_cycle_id),
            'payout', 108.00,
            'point_awarded', true
        ));
    END IF;
    
    -- 5. Atualizar venda com informações do ciclo
    UPDATE sales
    SET matrix_id = v_cycle_id,
        matrix_slot_filled = v_next_slot,
        career_points_generated = CASE WHEN v_next_slot = 6 THEN 1 ELSE 0 END
    WHERE id = v_sale_id;
    
    RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 9. POLÍTICAS RLS (Row Level Security)
-- ================================================

ALTER TABLE product_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriz_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Produtos: Todos podem ver ativos
CREATE POLICY "Produtos ativos são públicos" ON product_catalog
FOR SELECT USING (status = 'active');

-- Vendas: Usuário vê apenas suas vendas
CREATE POLICY "Usuário vê próprias vendas" ON sales
FOR SELECT USING (buyer_id IN (SELECT id FROM consultores WHERE user_id = auth.uid()));

-- Ciclos: Usuário vê apenas seus ciclos
CREATE POLICY "Usuário vê próprios ciclos" ON matriz_cycles
FOR SELECT USING (consultor_id IN (SELECT id FROM consultores WHERE user_id = auth.uid()));

-- Pontos: Usuário vê apenas seus pontos
CREATE POLICY "Usuário vê próprios pontos" ON career_points
FOR SELECT USING (consultor_id IN (SELECT id FROM consultores WHERE user_id = auth.uid()));

-- ================================================
-- 10. DADOS INICIAIS (SEED) - PRODUTOS
-- ================================================

-- Kit de Ativação SIGMA (Produto Principal)
INSERT INTO product_catalog (
    name,
    description,
    sku,
    price_base,
    price_consultor,
    price_cd,
    discount_consultor,
    discount_cd,
    category,
    status,
    is_featured,
    slug,
    meta_title,
    meta_description
) VALUES (
    'Kit de Ativação SIGMA 1x6',
    'Kit completo para ativação na matriz SIGMA. Inclui acesso ao sistema, materiais de treinamento e suporte completo para iniciar sua jornada no RS Prólipsi.',
    'KIT-SIGMA-1X6',
    120.00,
    60.00,
    50.88,
    50.00,
    57.60,
    'Ativação',
    'active',
    true,
    'kit-ativacao-sigma-1x6',
    'Kit de Ativação SIGMA 1x6 - RS Prólipsi',
    'Kit completo para iniciar na matriz SIGMA. Valor especial para consultores ativos.'
) ON CONFLICT (sku) DO NOTHING;

-- Exemplo: Produto adicional (Suplemento)
INSERT INTO product_catalog (
    name,
    description,
    sku,
    price_base,
    price_consultor,
    price_cd,
    discount_consultor,
    discount_cd,
    category,
    status,
    slug
) VALUES (
    'Suplemento Prólipsi Premium',
    'Suplemento alimentar de alta qualidade com fórmula exclusiva.',
    'SUPL-PREMIUM-001',
    150.00,
    75.00,
    63.60,
    50.00,
    57.60,
    'Produtos',
    'active',
    'suplemento-prolipsi-premium'
) ON CONFLICT (sku) DO NOTHING;

-- ================================================
-- FIM
-- ================================================
