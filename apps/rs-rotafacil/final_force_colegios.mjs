
import pg from 'pg';
import { fileURLToPath } from 'url';

const { Client } = pg;
const connectionString = 'postgresql://postgres:Yannis784512@@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function run() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        console.log('Applying policy public_read_all_colegios...');

        // Ensure RLS enabled
        await client.query('ALTER TABLE colegios ENABLE ROW LEVEL SECURITY;');

        // Drop old if exists (different name)
        await client.query('DROP POLICY IF EXISTS "public_read_all_colegios" ON colegios;');
        await client.query('DROP POLICY IF EXISTS "Public read access for colegios" ON colegios;');

        // Create
        await client.query(`
            CREATE POLICY "public_read_all_colegios" ON colegios
            FOR SELECT
            USING (true);
        `);

        // Grant
        await client.query('GRANT SELECT ON colegios TO anon, authenticated, service_role;');

        console.log('Success.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
