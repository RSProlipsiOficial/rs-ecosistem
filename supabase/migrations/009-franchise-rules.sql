-- ============================================================================
-- RS ECOSYSTEM - FRANCHISE RULES
-- Migration: 009-franchise-rules.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.franchise_rules (
    id SERIAL PRIMARY KEY,
    initial_cost DECIMAL(12, 2) DEFAULT 0.00,
    royalty_percentage DECIMAL(5, 2) DEFAULT 0.00,
    min_stock_purchase DECIMAL(12, 2) DEFAULT 0.00,
    marketing_fee DECIMAL(5, 2) DEFAULT 0.00,
    commission_percentage DECIMAL(5, 2) DEFAULT 15.20,
    allowed_payment_methods TEXT[] DEFAULT '{PIX, BOLETO, CARTAO}',
    contract_terms TEXT DEFAULT '',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserção da regra inicial (conforme solicitado pelo Roberto)
INSERT INTO public.franchise_rules (
    id, 
    initial_cost, 
    royalty_percentage, 
    min_stock_purchase, 
    marketing_fee, 
    commission_percentage
) VALUES (
    1, 
    2000.00,  -- Setup Inicial R$ 2.000
    0.00,     -- Royalties 0%
    500.00,   -- Recompra Mínima R$ 500
    0.00,     -- Fundo de Marketing 0%
    15.20     -- Comissão/Desconto do CD 15.2%
) ON CONFLICT (id) DO UPDATE SET
    initial_cost = EXCLUDED.initial_cost,
    royalty_percentage = EXCLUDED.royalty_percentage,
    min_stock_purchase = EXCLUDED.min_stock_purchase,
    marketing_fee = EXCLUDED.marketing_fee,
    commission_percentage = EXCLUDED.commission_percentage,
    updated_at = NOW();

-- RLS
ALTER TABLE public.franchise_rules ENABLE ROW LEVEL SECURITY;

-- Política simples: Apenas super_admins e admins podem ler/escrever
CREATE POLICY "Admins can manage franchise rules" ON public.franchise_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.uid() = id 
            AND (raw_user_meta_data->>'role' IN ('admin', 'super_admin'))
        )
    );

-- Política de leitura pública (opcional, se necessário para consultores verem)
CREATE POLICY "Public read for franchise rules" ON public.franchise_rules
    FOR SELECT USING (TRUE);
