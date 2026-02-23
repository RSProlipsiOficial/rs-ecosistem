-- 20251223_sync_schema.sql
-- Database schema for real-data synchronization

-- 1. Cycles Table
CREATE TABLE IF NOT EXISTS public.cycles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consultor_id UUID REFERENCES public.consultores(id) ON DELETE CASCADE,
    cycle_index INTEGER DEFAULT 1,
    status TEXT DEFAULT 'open', -- 'open', 'completed'
    slots_filled INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bonuses Table
CREATE TABLE IF NOT EXISTS public.bonuses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.consultores(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    bonus_type TEXT NOT NULL, -- 'cycle', 'depth', 'fidelity', 'top_sigma', 'career'
    description TEXT,
    reference_id UUID, -- Optional reference to cycle or other entity
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Wallets Table
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.consultores(id) ON DELETE CASCADE UNIQUE,
    balance NUMERIC(15, 2) DEFAULT 0.00,
    available_balance NUMERIC(15, 2) DEFAULT 0.00,
    blocked_balance NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Wallet Transactions Table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.consultores(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    type TEXT NOT NULL, -- 'credit', 'debit'
    operation TEXT NOT NULL, -- 'bonus', 'withdrawal', 'transfer', 'purchase'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Consultant Network (Stats) Table
CREATE TABLE IF NOT EXISTS public.consultant_network (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consultant_id UUID REFERENCES public.consultores(id) ON DELETE CASCADE UNIQUE,
    total_count INTEGER DEFAULT 0,
    active_count INTEGER DEFAULT 0,
    new_this_month INTEGER DEFAULT 0,
    last_sync TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Consultant Performance Table
CREATE TABLE IF NOT EXISTS public.consultant_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consultant_id UUID REFERENCES public.consultores(id) ON DELETE CASCADE UNIQUE,
    current_rank TEXT DEFAULT 'Iniciante',
    next_rank TEXT DEFAULT 'Bronze',
    points INTEGER DEFAULT 0,
    quarterLY_points INTEGER DEFAULT 0,
    last_update TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Sync Log Table
CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    initiated_by UUID REFERENCES auth.users(id),
    sync_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cycles_updated_at BEFORE UPDATE ON public.cycles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
