-- RS BACKEND SYNC MIGRATION
-- NÃO EXECUTAR AUTOMATICAMENTE
-- Revisar e aplicar manualmente no Supabase

-- ============================================================================
-- 0. TABELAS DE CONFIGURAÇÃO (SIGMA)
-- ============================================================================

-- SUGESTÃO: criar tabelas de configuração se não existirem
CREATE TABLE IF NOT EXISTS public.sigma_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cycle_value NUMERIC DEFAULT 360.00,
    cycle_payout_value NUMERIC DEFAULT 108.00,
    cycle_payout_percent NUMERIC DEFAULT 30,
    reentry_enabled BOOLEAN DEFAULT true,
    reentry_limit_per_month INTEGER DEFAULT 10,
    spillover_mode TEXT DEFAULT 'linha_ascendente',
    fidelity_source_percent NUMERIC DEFAULT 1.25,
    top_pool_percent NUMERIC DEFAULT 4.5,
    career_percent NUMERIC DEFAULT 6.39,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sigma_depth_levels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    settings_id UUID REFERENCES public.sigma_settings(id) ON DELETE CASCADE,
    level INTEGER NOT NULL,
    percent NUMERIC NOT NULL,
    value_per_cycle NUMERIC,
    order_index INTEGER
);

CREATE TABLE IF NOT EXISTS public.sigma_fidelity_levels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    settings_id UUID REFERENCES public.sigma_settings(id) ON DELETE CASCADE,
    level INTEGER NOT NULL,
    percent NUMERIC NOT NULL,
    value_per_cycle NUMERIC,
    order_index INTEGER
);

CREATE TABLE IF NOT EXISTS public.sigma_top10_levels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    settings_id UUID REFERENCES public.sigma_settings(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    percent_of_pool NUMERIC NOT NULL,
    pool_percent_base NUMERIC,
    order_index INTEGER
);

CREATE TABLE IF NOT EXISTS public.sigma_career_pins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    settings_id UUID REFERENCES public.sigma_settings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cycles_required INTEGER NOT NULL,
    min_lines_required INTEGER DEFAULT 0,
    vmec_distribution TEXT,
    reward_value NUMERIC DEFAULT 0,
    order_index INTEGER
);

-- ============================================================================
-- 1. TABELAS LOGÍSTICA (rs-logistica)
-- ============================================================================

-- SUGESTÃO: criar tabela logistics_orders
-- Baseado em: apps/rs-logistica/src/index.js e contracts/logistics.ts
CREATE TABLE IF NOT EXISTS public.logistics_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT NOT NULL, -- ID do pedido original (ex: do marketplace)
    payment_id TEXT,        -- ID do pagamento confirmado
    amount NUMERIC(10, 2),  -- Valor total
    customer JSONB,         -- Dados do cliente (nome, endereço, etc)
    items JSONB,            -- Lista de itens a separar
    cd_id TEXT,             -- ID do Centro de Distribuição responsável
    status TEXT DEFAULT 'pending', -- pending, preparing, dispatched, delivered, canceled
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para busca rápida por pedido
CREATE INDEX IF NOT EXISTS idx_logistics_orders_order_id ON public.logistics_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_logistics_orders_status ON public.logistics_orders(status);

-- ============================================================================
-- 2. TABELAS SIGMA (rs-core)
-- ============================================================================

-- SUGESTÃO: criar tabela cycles
-- Baseado em: apps/rs-core/src/engine/sigmeCycle.ts e contracts/sigma.ts
CREATE TABLE IF NOT EXISTS public.cycles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cycle_id TEXT UNIQUE NOT NULL, -- Identificador único do ciclo (ex: C-12345)
    consultor_id TEXT NOT NULL,    -- ID do consultor dono do ciclo
    slots_total INTEGER DEFAULT 6, -- Total de posições no ciclo
    slots_filled INTEGER DEFAULT 0,-- Posições preenchidas
    status TEXT DEFAULT 'open',    -- open, completed, canceled
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para buscar ciclos de um consultor
CREATE INDEX IF NOT EXISTS idx_cycles_consultor_id ON public.cycles(consultor_id);
CREATE INDEX IF NOT EXISTS idx_cycles_status ON public.cycles(status);

-- ============================================================================
-- 3. FUNÇÕES WALLET (RPCs)
-- ============================================================================

-- SUGESTÃO: criar RPC confirm_deposit
-- Baseado em: apps/rs-api/src/controllers/wallet.controller.js
-- Assinatura esperada: (p_deposit_id, p_transaction_id) -> JSONB
CREATE OR REPLACE FUNCTION public.confirm_deposit(
    p_deposit_id TEXT,
    p_transaction_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deposit RECORD;
    v_wallet RECORD;
BEGIN
    -- 1. Buscar depósito pendente
    -- SELECT * INTO v_deposit FROM wallet_deposits WHERE id = p_deposit_id AND status = 'pending';
    -- IF NOT FOUND THEN RAISE EXCEPTION 'Depósito não encontrado ou já processado'; END IF;

    -- 2. Atualizar status do depósito
    -- UPDATE wallet_deposits SET status = 'confirmed', transaction_id = p_transaction_id, updated_at = NOW() WHERE id = p_deposit_id;

    -- 3. Creditar na wallet
    -- UPDATE wallets SET saldo_disponivel = saldo_disponivel + v_deposit.amount WHERE consultor_id = v_deposit.user_id;

    -- MOCK TEMPORÁRIO (Remover após implementar tabelas reais de depósito)
    RETURN jsonb_build_object('success', true, 'message', 'Depósito confirmado (MOCK)');
END;
$$;

-- SUGESTÃO: criar RPC process_deposit
-- Baseado em: apps/rs-api/src/controllers/wallet.controller.js
CREATE OR REPLACE FUNCTION public.process_deposit(
    p_user_id TEXT,
    p_amount NUMERIC,
    p_method TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- TODO: Implementar lógica de criação de registro de depósito
    RETURN jsonb_build_object('success', true, 'deposit_id', 'mock-deposit-id');
END;
$$;

-- SUGESTÃO: criar RPC get_wallet_statement
-- Baseado em: apps/rs-api/src/controllers/wallet.controller.js
CREATE OR REPLACE FUNCTION public.get_wallet_statement(
    p_user_id TEXT,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    type TEXT,
    amount NUMERIC,
    description TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wt.id,
        wt.type,
        wt.amount,
        wt.description,
        wt.created_at
    FROM wallet_transactions wt
    WHERE wt.user_id = p_user_id
    AND (p_start_date IS NULL OR wt.created_at >= p_start_date)
    AND (p_end_date IS NULL OR wt.created_at <= p_end_date)
    ORDER BY wt.created_at DESC;
END;
$$;

-- SUGESTÃO: criar RPC transfer_between_wallets
-- Baseado em: apps/rs-api/src/controllers/wallet.controller.js
CREATE OR REPLACE FUNCTION public.transfer_between_wallets(
    p_from_user_id TEXT,
    p_to_user_id TEXT,
    p_amount NUMERIC,
    p_description TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_saldo NUMERIC;
BEGIN
    -- Verificar saldo
    SELECT saldo_disponivel INTO v_saldo FROM wallets WHERE consultor_id = p_from_user_id;
    
    IF v_saldo < p_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'Saldo insuficiente');
    END IF;

    -- Debitar origem
    UPDATE wallets SET saldo_disponivel = saldo_disponivel - p_amount WHERE consultor_id = p_from_user_id;
    
    -- Creditar destino
    UPDATE wallets SET saldo_disponivel = saldo_disponivel + p_amount WHERE consultor_id = p_to_user_id;

    -- Registrar transações (simplificado)
    INSERT INTO wallet_transactions (user_id, type, amount, description, created_at)
    VALUES (p_from_user_id, 'debit', p_amount, 'Transferência enviada: ' || p_description, NOW());

    INSERT INTO wallet_transactions (user_id, type, amount, description, created_at)
    VALUES (p_to_user_id, 'credit', p_amount, 'Transferência recebida: ' || p_description, NOW());

    RETURN jsonb_build_object('success', true);
END;
$$;
