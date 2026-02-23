-- ============================================================================
-- RS ECOSYSTEM - MINISITE PROFILES TABLE
-- Migration: 005-minisite-profiles.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.minisite_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    cpf TEXT,
    phone TEXT,
    avatar_url TEXT,
    consultant_id TEXT,
    referral_link TEXT,
    mercado_pago_public_key TEXT,
    mercado_pago_access_token TEXT,
    
    -- Address Fields
    address_street TEXT,
    address_number TEXT,
    address_neighborhood TEXT,
    address_city TEXT,
    address_state TEXT,
    address_zip TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.minisite_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.minisite_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.minisite_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.minisite_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_minisite_profiles_updated_at ON public.minisite_profiles;
CREATE TRIGGER tr_minisite_profiles_updated_at
    BEFORE UPDATE ON public.minisite_profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Index
CREATE INDEX IF NOT EXISTS idx_minisite_profiles_id ON public.minisite_profiles(id);
