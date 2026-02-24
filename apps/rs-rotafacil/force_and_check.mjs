
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

        console.log('Starting transaction...');
        await client.query('BEGIN');

        console.log('1. Enabling RLS...');
        await client.query('ALTER TABLE colegios ENABLE ROW LEVEL SECURITY;');

        console.log('2. Dropping old policy...');
        await client.query('DROP POLICY IF EXISTS "Public read access for colegios" ON colegios;');

        console.log('3. Creating new policy...');
        await client.query(`
            CREATE POLICY "Public read access for colegios" ON colegios
            FOR SELECT
            USING (true);
        `);

        console.log('4. Granting permissions...');
        await client.query('GRANT SELECT ON colegios TO anon, authenticated, service_role;');

        console.log('5. Checking policies inside transaction...');
        const res = await client.query(`
            SELECT policyname, roles, cmd, qual 
            FROM pg_policies 
            WHERE tablename = 'colegios';
        `);
        console.log(JSON.stringify(res.rows, null, 2));

        console.log('Committing...');
        await client.query('COMMIT');
        console.log('Done.');

    } catch (err) {
        console.error('Error:', err);
        await client.query('ROLLBACK');
    } finally {
        await client.end();
    }
}

run();
