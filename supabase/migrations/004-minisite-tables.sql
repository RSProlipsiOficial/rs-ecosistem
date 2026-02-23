-- ============================================================================
-- RS ECOSYSTEM - MINISITE MODULE TABLES
-- Migration: 004-minisite-tables.sql
-- ============================================================================

-- 1. TABELA: minisite_biosites
CREATE TABLE IF NOT EXISTS public.minisite_biosites (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id TEXT, -- Optional link to a client managed by the agency
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(50) DEFAULT 'free',
    sections JSONB DEFAULT '[]',
    theme JSONB DEFAULT '{}',
    is_published BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    seo JSONB DEFAULT '{}',
    tracking JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA: minisite_clients
CREATE TABLE IF NOT EXISTS public.minisite_clients (
    id TEXT PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    notes TEXT,
    monthly_fee NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA: minisite_payments
CREATE TABLE IF NOT EXISTS public.minisite_payments (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES public.minisite_clients(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    method VARCHAR(50),
    due_date TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA: minisite_system_logs
CREATE TABLE IF NOT EXISTS public.minisite_system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id),
    actor_name VARCHAR(255),
    actor_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    target VARCHAR(255),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES

ALTER TABLE public.minisite_biosites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minisite_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minisite_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minisite_system_logs ENABLE ROW LEVEL SECURITY;

-- Biosites: Users see their own sites
CREATE POLICY "Users can view their own biosites" ON public.minisite_biosites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own biosites" ON public.minisite_biosites
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own biosites" ON public.minisite_biosites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own biosites" ON public.minisite_biosites
    FOR DELETE USING (auth.uid() = user_id);

-- Public access to published biosites by slug
CREATE POLICY "Public can view published biosites" ON public.minisite_biosites
    FOR SELECT USING (is_published = true);

-- Clients: Agencies see their own clients
CREATE POLICY "Agencies can view their own clients" ON public.minisite_clients
    FOR SELECT USING (auth.uid() = agency_id);

CREATE POLICY "Agencies can manage their own clients" ON public.minisite_clients
    FOR ALL USING (auth.uid() = agency_id);

-- Payments: Agencies see payments of their clients
CREATE POLICY "Agencies can view their client payments" ON public.minisite_payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.minisite_clients 
            WHERE id = client_id AND agency_id = auth.uid()
        )
    );

-- System Logs: (Restrictive by default, or accessible by admin)
CREATE POLICY "Admins can view all logs" ON public.minisite_system_logs
    FOR SELECT USING (true); -- Simplified for now, should check admin role

-- RPC: increment_minisite_views
CREATE OR REPLACE FUNCTION public.increment_minisite_views(site_id TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.minisite_biosites 
    SET views = views + 1 
    WHERE id = site_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indices
CREATE INDEX IF NOT EXISTS idx_minisite_biosites_user ON public.minisite_biosites(user_id);
CREATE INDEX IF NOT EXISTS idx_minisite_biosites_slug ON public.minisite_biosites(slug);
CREATE INDEX IF NOT EXISTS idx_minisite_clients_agency ON public.minisite_clients(agency_id);
CREATE INDEX IF NOT EXISTS idx_minisite_payments_client ON public.minisite_payments(client_id);
