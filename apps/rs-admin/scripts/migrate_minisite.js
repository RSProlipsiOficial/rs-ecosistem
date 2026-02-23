const { Client } = require('pg');

// Discovered credentials from rs-api/apply_db_changes.js
const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const sql = `
ALTER TABLE public.minisite_profiles 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'consultant',
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS wallet_balance numeric DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_minisite_profiles_type ON public.minisite_profiles(type);
`;

async function applyMigration() {
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting to DB...');
        await client.connect();

        console.log('Executing migration SQL...');
        await client.query(sql);
        console.log('Migration successful: Columns added to minisite_profiles.');

    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await client.end();
    }
}

applyMigration();
