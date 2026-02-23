-- ================================================
-- RS PRÓLIPSI - MIGRATIONS FIXES (AUDITORIA)
-- ================================================

-- 1. Tabela logistics_orders
CREATE TABLE IF NOT EXISTS public.logistics_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT NOT NULL,
    payment_id TEXT,
    buyer_id UUID REFERENCES public.consultores(id),
    amount NUMERIC(10, 2),
    customer JSONB,
    items JSONB,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela matriz_cycles (SIGMA)
-- Padronizada para suportar a lógica do rs-core e rs-api
CREATE TABLE IF NOT EXISTS public.matriz_cycles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consultor_id UUID REFERENCES public.consultores(id) NOT NULL,
    cycle_number INTEGER DEFAULT 1,
    slots_filled INTEGER DEFAULT 0,
    status TEXT DEFAULT 'open', -- open, completed
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(consultor_id, cycle_number)
);

-- 3. RPC: block_balance
-- Bloqueia saldo para solicitação de saque
CREATE OR REPLACE FUNCTION public.block_balance(p_wallet_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
BEGIN
    UPDATE public.wallets 
    SET blocked_balance = blocked_balance + p_amount,
        balance = balance - p_amount
    WHERE id = p_wallet_id AND balance >= p_amount;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Saldo insuficiente ou carteira não encontrada';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RPC: unblock_balance
-- Estorna saldo bloqueado caso o saque seja rejeitado
CREATE OR REPLACE FUNCTION public.unblock_balance(p_wallet_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
BEGIN
    UPDATE public.wallets 
    SET blocked_balance = blocked_balance - p_amount,
        balance = balance + p_amount
    WHERE id = p_wallet_id AND blocked_balance >= p_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC: transfer_between_wallets
-- Transferência P2P entre consultores
CREATE OR REPLACE FUNCTION public.transfer_between_wallets(p_sender_id UUID, p_receiver_id UUID, p_amount NUMERIC)
RETURNS JSONB AS $$
DECLARE
    v_sender_wallet UUID;
    v_receiver_wallet UUID;
BEGIN
    SELECT id INTO v_sender_wallet FROM public.wallets WHERE owner_id = p_sender_id;
    SELECT id INTO v_receiver_wallet FROM public.wallets WHERE owner_id = p_receiver_id;
    
    IF v_sender_wallet IS NULL OR v_receiver_wallet IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Carteira não encontrada');
    END IF;
    
    UPDATE public.wallets SET balance = balance - p_amount WHERE id = v_sender_wallet AND balance >= p_amount;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Saldo insuficiente');
    END IF;
    
    UPDATE public.wallets SET balance = balance + p_amount WHERE id = v_receiver_wallet;
    
    -- Registrar transações
    INSERT INTO public.wallet_transactions (wallet_id, type, amount, description)
    VALUES (v_sender_wallet, 'transfer_out', p_amount, 'Transferência enviada');
    
    INSERT INTO public.wallet_transactions (wallet_id, type, amount, description)
    VALUES (v_receiver_wallet, 'transfer_in', p_amount, 'Transferência recebida');
    
    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
