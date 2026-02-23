const { Client } = require('pg');

// Discovered credentials
const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const sql = `
ALTER TABLE public.minisite_profiles 
ADD COLUMN IF NOT EXISTS cd_id uuid REFERENCES public.minisite_profiles(id);

CREATE INDEX IF NOT EXISTS idx_minisite_profiles_cd_id ON public.minisite_profiles(cd_id);
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
        console.log('Migration successful: cd_id added to minisite_profiles.');

    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await client.end();
    }
}

applyMigration();
