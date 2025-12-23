
import { Client } from 'pg';

const CONNECTION_STRING = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

// Schema based on apps/rs-admin/types.ts and import needs
// We use 'text' for IDs to be flexible (uuid or string code)
const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS public.consultants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internal_code TEXT UNIQUE,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    cpf TEXT,
    phone TEXT,
    pin TEXT,
    sponsor_id UUID REFERENCES public.consultants(id),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'Ativo',
    avatar TEXT,
    balance NUMERIC DEFAULT 0,
    network TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for searching
CREATE INDEX IF NOT EXISTS idx_consultants_email ON public.consultants(email);
CREATE INDEX IF NOT EXISTS idx_consultants_internal_code ON public.consultants(internal_code);
CREATE INDEX IF NOT EXISTS idx_consultants_sponsor_id ON public.consultants(sponsor_id);

-- Enable RLS (Security Best Practice)
ALTER TABLE public.consultants ENABLE ROW LEVEL SECURITY;

-- Policy: Allow Service Role (full access) - Implicit usually, but good to be sure
-- Policy: Allow Anon Select (if we want public directory? Maybe constrained)
-- For now, we trust Service Role Key bypasses RLS.
`;

async function main() {
    console.log('🔌 Connecting to Database...');
    const client = new Client({ connectionString: CONNECTION_STRING });
    
    try {
        await client.connect();
        console.log('✅ Connected.');
        
        console.log('🛠️  Creating Table "consultants"...');
        await client.query(CREATE_TABLE_SQL);
        console.log('✅ Table created/verified.');
        
        // Optional: Check if empty
        const res = await client.query('SELECT COUNT(*) FROM public.consultants');
        console.log(`📊 Current Row Count: ${res.rows[0].count}`);

    } catch (e: any) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
        console.log('👋 Disconnected.');
    }
}

main().catch(console.error);
