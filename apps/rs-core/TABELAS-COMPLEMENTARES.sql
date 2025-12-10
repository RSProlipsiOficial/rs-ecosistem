-- ================================================
-- RS PRÓLIPSI - TABELAS COMPLEMENTARES
-- Tabelas adicionais para marketplace e integração
-- ================================================
-- Execute no SQL Editor do Supabase
-- ================================================

-- ================================================
-- 1. orders (Pedidos do Marketplace)
-- ================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Cliente/Comprador
    buyer_id UUID REFERENCES consultores(id),
    buyer_email VARCHAR(255) NOT NULL,
    buyer_name VARCHAR(255) NOT NULL,
    buyer_phone VARCHAR(20),
    buyer_type VARCHAR(20) DEFAULT 'cliente', -- 'cliente', 'consultor', 'cd'
    
    -- Indicação/Afiliação
    referred_by UUID REFERENCES consultores(id), -- Quem indicou
    affiliate_link VARCHAR(255), -- Link usado
    
    -- Valores
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    
    -- Acumulador para matriz (soma produtos até R$ 60)
    matrix_accumulated DECIMAL(10, 2) DEFAULT 0.00,
    contributes_to_matrix BOOLEAN DEFAULT true,
    
    -- Pagamento
    payment_method VARCHAR(50), -- 'mercadopago', 'pix', 'boleto'
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, refunded
    payment_id VARCHAR(255), -- ID externo (MP, etc)
    payment_date TIMESTAMP,
    
    -- Entrega
    shipping_address JSONB NOT NULL,
    shipping_method VARCHAR(50),
    shipping_tracking VARCHAR(100),
    delivery_status VARCHAR(20) DEFAULT 'pending', -- pending, shipped, delivered
    delivery_date TIMESTAMP,
    
    -- Status geral
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, processing, shipped, delivered, cancelled
    
    -- Notas
    customer_notes TEXT,
    internal_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_referred ON orders(referred_by);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

-- ================================================
-- 2. order_items (Itens do Pedido)
-- ================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES product_catalog(id) NOT NULL,
    
    -- Snapshot do produto (para histórico)
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    product_image TEXT,
    
    -- Valores
    price_original DECIMAL(10, 2) NOT NULL,
    price_discount DECIMAL(10, 2) DEFAULT 0.00,
    price_final DECIMAL(10, 2) NOT NULL,
    
    -- Quantidade
    quantity INTEGER DEFAULT 1,
    total DECIMAL(10, 2) NOT NULL, -- price_final * quantity
    
    -- Matriz
    contributes_to_matrix BOOLEAN DEFAULT true,
    matrix_value DECIMAL(10, 2) DEFAULT 0.00, -- Quanto contribui para os R$ 60
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- ================================================
-- 3. cycle_events (Eventos de Ciclo)
-- ================================================
CREATE TABLE IF NOT EXISTS cycle_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Ciclo
    cycle_id UUID REFERENCES matriz_cycles(id),
    consultor_id UUID REFERENCES consultores(id) NOT NULL,
    
    -- Evento
    event_type VARCHAR(50) NOT NULL, -- 'cycle_opened', 'cycle_completed', 'slot_filled', 'bonus_paid'
    event_data JSONB,
    
    -- Processamento
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP,
    error TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cycle_events_consultor ON cycle_events(consultor_id);
CREATE INDEX IF NOT EXISTS idx_cycle_events_type ON cycle_events(event_type);
CREATE INDEX IF NOT EXISTS idx_cycle_events_processed ON cycle_events(processed);

-- ================================================
-- 4. payment_errors (Log de Erros de Pagamento)
-- ================================================
CREATE TABLE IF NOT EXISTS payment_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    payment_id VARCHAR(255),
    order_id UUID REFERENCES orders(id),
    
    error_message TEXT NOT NULL,
    error_stack TEXT,
    webhook_data JSONB,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_errors_order ON payment_errors(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_errors_created ON payment_errors(created_at);

-- ================================================
-- 5. downlines (Estrutura de Rede)
-- ================================================
CREATE TABLE IF NOT EXISTS downlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    upline_id UUID REFERENCES consultores(id) NOT NULL,
    downline_id UUID REFERENCES consultores(id) NOT NULL,
    
    -- Posição na matriz
    linha INTEGER, -- 1 a 6 (matriz 6x6)
    nivel INTEGER, -- Profundidade (sem limite)
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(upline_id, downline_id)
);

CREATE INDEX IF NOT EXISTS idx_downlines_upline ON downlines(upline_id);
CREATE INDEX IF NOT EXISTS idx_downlines_downline ON downlines(downline_id);
CREATE INDEX IF NOT EXISTS idx_downlines_linha ON downlines(linha);
CREATE INDEX IF NOT EXISTS idx_downlines_nivel ON downlines(nivel);

-- ================================================
-- 6. matrix_accumulator (Acumulador de R$ 60)
-- ================================================
CREATE TABLE IF NOT EXISTS matrix_accumulator (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    consultor_id UUID REFERENCES consultores(id) UNIQUE NOT NULL,
    
    -- Acumulador
    accumulated_value DECIMAL(10, 2) DEFAULT 0.00, -- Soma até R$ 60
    target_value DECIMAL(10, 2) DEFAULT 60.00, -- Meta para ativar
    
    -- Ciclo atual
    current_cycle_id UUID REFERENCES matriz_cycles(id),
    
    -- Histórico
    total_activated INTEGER DEFAULT 0, -- Quantas vezes ativou
    
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matrix_accumulator_consultor ON matrix_accumulator(consultor_id);

-- ================================================
-- COMENTÁRIOS
-- ================================================

COMMENT ON TABLE orders IS 'Pedidos do marketplace com acumulador de R$ 60 para matriz';
COMMENT ON TABLE order_items IS 'Itens individuais de cada pedido';
COMMENT ON TABLE cycle_events IS 'Eventos de ciclo para processamento assíncrono de bônus';
COMMENT ON TABLE payment_errors IS 'Log de erros de pagamento para debugging';
COMMENT ON TABLE downlines IS 'Estrutura de rede com spillover e compressão dinâmica';
COMMENT ON TABLE matrix_accumulator IS 'Acumula compras até R$ 60 para ativar matriz';

-- ================================================
-- FIM
-- ================================================

-- Verificar tabelas criadas:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'order_items', 'cycle_events', 'payment_errors', 'downlines', 'matrix_accumulator');
