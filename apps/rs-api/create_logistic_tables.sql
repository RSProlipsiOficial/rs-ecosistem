-- ============================================================================
-- RS ECOSYSTEM - CENTROS DE DISTRIBUIÇÃO (MODULO LOGÍSTICO v1.0)
-- Seguindo PRD: PRD_RS_Logistica_Centros_Distribuicao.txt
-- ============================================================================

-- 1. Tabela Principal de CDs
CREATE TABLE IF NOT EXISTS public.distribution_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    razao_social VARCHAR(255),
    cnpj_cpf VARCHAR(20),
    manager_id UUID REFERENCES public.consultores(id) ON DELETE SET NULL,
    manager_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    pix_key VARCHAR(255),
    address_street TEXT,
    address_number VARCHAR(20),
    address_neighborhood VARCHAR(100),
    address_city VARCHAR(100),
    address_state CHAR(2),
    address_zip VARCHAR(20),
    type VARCHAR(50) DEFAULT 'MUNICIPAL', -- Regional, Estadual, Municipal, Delivery, Central
    status VARCHAR(50) DEFAULT 'ativo',   -- ativo, bloqueado, pendente
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Estoque Local do CD
CREATE TABLE IF NOT EXISTS public.cd_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cd_id UUID REFERENCES public.distribution_centers(id) ON DELETE CASCADE,
    product_id UUID, -- Referência futura ao product_catalog
    sku VARCHAR(50) NOT NULL,
    quantity INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 5,
    last_replenishment TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cd_id, sku)
);

-- 3. Pedidos Processados pelo CD
CREATE TABLE IF NOT EXISTS public.cd_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cd_id UUID REFERENCES public.distribution_centers(id) ON DELETE CASCADE,
    customer_id UUID,
    consultant_name VARCHAR(255),
    total_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_points INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'PENDENTE', -- PENDENTE, SEPARAÇÃO, CONCLUÍDO
    type VARCHAR(50) DEFAULT 'RETIRADA',   -- RETIRADA, ENTREGA
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Logs de Auditoria do Módulo Logístico
CREATE TABLE IF NOT EXISTS public.cd_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cd_id UUID REFERENCES public.distribution_centers(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details JSONB,
    performed_by UUID, -- ID do Admin
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Básico (Admin pode tudo)
ALTER TABLE public.distribution_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cd_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cd_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to CDs" ON public.distribution_centers FOR ALL USING (true);
CREATE POLICY "Admins have full access to CD Inventory" ON public.cd_inventory FOR ALL USING (true);
CREATE POLICY "Admins have full access to CD Orders" ON public.cd_orders FOR ALL USING (true);

-- Comentário para futuras migrações
COMMENT ON TABLE distribution_centers IS 'Tabela central do Módulo Logístico da RS Prólipsi';
