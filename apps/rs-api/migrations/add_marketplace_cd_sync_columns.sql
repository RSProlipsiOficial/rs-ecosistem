-- =====================================================
-- MIGRATION: Criar infraestrutura de sincronização Marketplace → RS-CDS
-- Executar no Supabase SQL Editor (https://rptkhrboejbwexseikuo.supabase.co)
-- =====================================================

-- 1) Adicionar colunas em orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS distributor_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS referrer_id TEXT;
CREATE INDEX IF NOT EXISTS idx_orders_distributor_id ON orders(distributor_id);

-- 2) Criar tabela cd_orders (pedidos do Centro de Distribuição)
CREATE TABLE IF NOT EXISTS cd_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cd_id TEXT NOT NULL,
    consultant_name TEXT,
    consultant_pin TEXT,
    sponsor_name TEXT,
    sponsor_id TEXT,
    buyer_cpf TEXT,
    buyer_email TEXT,
    buyer_phone TEXT,
    shipping_address TEXT,
    order_date DATE DEFAULT CURRENT_DATE,
    order_time TIME DEFAULT CURRENT_TIME,
    total NUMERIC(12,2) DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    status TEXT DEFAULT 'PENDENTE',
    type TEXT DEFAULT 'MARKETPLACE',
    items_count INTEGER DEFAULT 0,
    tracking_code TEXT,
    vehicle_plate TEXT,
    marketplace_order_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cd_orders_cd_id ON cd_orders(cd_id);
CREATE INDEX IF NOT EXISTS idx_cd_orders_status ON cd_orders(status);
CREATE INDEX IF NOT EXISTS idx_cd_orders_marketplace ON cd_orders(marketplace_order_id);

-- 3) Criar tabela cd_order_items (itens dos pedidos do CD)
CREATE TABLE IF NOT EXISTS cd_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cd_order_id UUID NOT NULL REFERENCES cd_orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(12,2) DEFAULT 0,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cd_order_items_order ON cd_order_items(cd_order_id);

-- 4) RLS (Row Level Security) - Acesso público para leitura (MVP)
ALTER TABLE cd_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cd_order_items ENABLE ROW LEVEL SECURITY;

-- Política: service_role pode tudo (API backend)
CREATE POLICY "service_role_full_access_cd_orders" ON cd_orders
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_full_access_cd_order_items" ON cd_order_items
    FOR ALL USING (auth.role() = 'service_role');

-- Política: anon pode ler (para o frontend RS-CDS)
CREATE POLICY "anon_read_cd_orders" ON cd_orders
    FOR SELECT USING (true);

CREATE POLICY "anon_read_cd_order_items" ON cd_order_items
    FOR SELECT USING (true);

-- Verificação final
SELECT 'cd_orders criada' AS status, count(*) AS total FROM cd_orders
UNION ALL
SELECT 'cd_order_items criada', count(*) FROM cd_order_items;
