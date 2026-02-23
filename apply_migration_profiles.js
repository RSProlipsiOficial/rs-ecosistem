import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const SQL = `
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
    address_street TEXT,
    address_number TEXT,
    address_neighborhood TEXT,
    address_city TEXT,
    address_state TEXT,
    address_zip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.minisite_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'minisite_profiles' AND policyname = 'Users can view their own profile'
    ) THEN
        CREATE POLICY "Users can view their own profile" ON public.minisite_profiles FOR SELECT USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'minisite_profiles' AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile" ON public.minisite_profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
    
     IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'minisite_profiles' AND policyname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile" ON public.minisite_profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.handle_minisite_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_minisite_profiles_updated_at ON public.minisite_profiles;
CREATE TRIGGER tr_minisite_profiles_updated_at
    BEFORE UPDATE ON public.minisite_profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_minisite_updated_at();

CREATE INDEX IF NOT EXISTS idx_minisite_profiles_id ON public.minisite_profiles(id);
`;

async function run() {
    console.log('Applying migration...');
    // supabase-js doesn't execute SQL directly usually, unless rpc is enabled or using a specific endpoint. 
    // BUT we can use the 'rpc' to call 'execute_sql' if it exists (some projects have it).
    // Or we simply hope that 'check_minisite_tables.js' confirms we can connect.
    // Wait, the standard supabase-js client does NOT allow raw SQL execution unless via RPC function exposed.

    // Let's check if there is an RPC for executing SQL. Many ecosystem starters have 'exec_sql' or similar.
    // If not, we CANNOT run this migration via supabase-js client easily.

    // HOWEVER, I see 'mcp_supabase' failed authentication.
    // I will try to use the 'rpc' method 'exec' or 'execute_sql' just in case.

    // Checking known migrations...
    // The user's system likely doesn't have a 'exec_sql' function exposed to public.

    // Alternative: If I cannot run SQL, I cannot apply migration.
    // But wait, I can use the MANAGEMENT API if I have it? No.

    // Let's TRY to see if there is an RPC.
    const { error } = await supabase.rpc('execute_sql', { query: SQL }); // Speculative

    if (error) {
        console.log('Default RPC execute_sql failed:', error.message);
        console.log('This is expected if the function is not defined.');
        console.log('Please run the SQL manually in Supabase Dashboard SQL Editor.');
    } else {
        console.log('Migration applied successfully via RPC!');
    }
}

run();
