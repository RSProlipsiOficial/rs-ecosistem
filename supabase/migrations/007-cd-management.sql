-- ============================================================================
-- RS ECOSYSTEM - CD MANAGEMENT TABLES
-- Migration: 007-cd-management.sql
-- ============================================================================

-- 1. CD Profiles (Extends user_profiles or standalone)
CREATE TABLE IF NOT EXISTS public.cd_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'PROPRIO', -- PROPRIO, FRANQUIA, HIBRIDO
    manager_name VARCHAR(255),
    avatar_url TEXT,
    region VARCHAR(255),
    wallet_balance DECIMAL(12, 2) DEFAULT 0.00,
    active_customers INTEGER DEFAULT 0,
    monthly_cycles INTEGER DEFAULT 0,
    
    -- Settings stored as JSONB for flexibility
    settings_profile JSONB DEFAULT '{}',
    settings_bank JSONB DEFAULT '{}',
    settings_payment_gateway JSONB DEFAULT '{}',
    settings_shipping_gateway JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CD Products (Inventory)
CREATE TABLE IF NOT EXISTS public.cd_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cd_id UUID REFERENCES public.cd_profiles(id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    stock_level INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    price DECIMAL(12, 2) DEFAULT 0.00,
    cost_price DECIMAL(12, 2) DEFAULT 0.00,
    points INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'OK', -- OK, BAIXO, CRITICO
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cd_id, sku)
);

-- 3. CD Orders
CREATE TABLE IF NOT EXISTS public.cd_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cd_id UUID REFERENCES public.cd_profiles(id) ON DELETE CASCADE,
    consultant_name VARCHAR(255),
    consultant_pin VARCHAR(50),
    sponsor_name VARCHAR(255),
    sponsor_id VARCHAR(50),
    buyer_cpf VARCHAR(20),
    buyer_email VARCHAR(255),
    buyer_phone VARCHAR(20),
    shipping_address TEXT,
    order_date DATE DEFAULT CURRENT_DATE,
    order_time TIME DEFAULT CURRENT_TIME,
    total DECIMAL(12, 2) DEFAULT 0.00,
    total_points INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'PENDENTE', -- PENDENTE, SEPARACAO, AGUARDANDO_RETIRADA, EM_TRANSPORTE, CONCLUIDO
    type VARCHAR(50) DEFAULT 'RETIRADA', -- RETIRADA, ENTREGA
    items_count INTEGER DEFAULT 0,
    tracking_code VARCHAR(100),
    vehicle_plate VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CD Order Items
CREATE TABLE IF NOT EXISTS public.cd_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.cd_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.cd_products(id),
    product_name VARCHAR(255),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(12, 2) DEFAULT 0.00,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CD Transactions
CREATE TABLE IF NOT EXISTS public.cd_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cd_id UUID REFERENCES public.cd_profiles(id) ON DELETE CASCADE,
    description TEXT,
    type VARCHAR(10) DEFAULT 'IN', -- IN, OUT
    category VARCHAR(50), -- VENDA, COMPRA_ESTOQUE, COMISSAO, SAQUE, TAXA
    amount DECIMAL(12, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'CONCLUIDO', -- CONCLUIDO, PENDENTE, CANCELADO
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CD Customers
CREATE TABLE IF NOT EXISTS public.cd_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cd_id UUID REFERENCES public.cd_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    last_purchase_date DATE,
    total_spent DECIMAL(12, 2) DEFAULT 0.00,
    orders_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ATIVO', -- ATIVO, INATIVO
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES (Simplificadas para o MVP)
ALTER TABLE public.cd_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cd_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cd_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cd_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cd_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cd_customers ENABLE ROW LEVEL SECURITY;

-- Exemplo de política: Usuário logado pode ver tudo do seu CD
-- (Assumindo que vinculamos o cd_profile ao user_id do auth.users)

CREATE POLICY "CD owners can manage their profiles" ON public.cd_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "CD owners can manage their products" ON public.cd_products
    FOR ALL USING (cd_id IN (SELECT id FROM public.cd_profiles WHERE user_id = auth.uid()));

CREATE POLICY "CD owners can manage their orders" ON public.cd_orders
    FOR ALL USING (cd_id IN (SELECT id FROM public.cd_profiles WHERE user_id = auth.uid()));

CREATE POLICY "CD owners can manage their order items" ON public.cd_order_items
    FOR ALL USING (order_id IN (SELECT id FROM public.cd_orders WHERE cd_id IN (SELECT id FROM public.cd_profiles WHERE user_id = auth.uid())));

CREATE POLICY "CD owners can manage their transactions" ON public.cd_transactions
    FOR ALL USING (cd_id IN (SELECT id FROM public.cd_profiles WHERE user_id = auth.uid()));

CREATE POLICY "CD owners can manage their customers" ON public.cd_customers
    FOR ALL USING (cd_id IN (SELECT id FROM public.cd_profiles WHERE user_id = auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER tr_cd_profiles_updated_at BEFORE UPDATE ON public.cd_profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER tr_cd_products_updated_at BEFORE UPDATE ON public.cd_products FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER tr_cd_orders_updated_at BEFORE UPDATE ON public.cd_orders FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER tr_cd_customers_updated_at BEFORE UPDATE ON public.cd_customers FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
