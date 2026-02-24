
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const connectionString = 'postgresql://postgres:Yannis784512@@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function forceApply() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        console.log('1. Enabling RLS on colegios...');
        await client.query('ALTER TABLE colegios ENABLE ROW LEVEL SECURITY;');

        console.log('2. Dropping existing public policy...');
        await client.query('DROP POLICY IF EXISTS "Public read access for colegios" ON colegios;');

        console.log('3. Creating public policy...');
        await client.query(`
            CREATE POLICY "Public read access for colegios" ON colegios
            FOR SELECT
            USING (true);
        `);

        console.log('4. Granting SELECT to anon/authenticated (just within case)...');
        await client.query('GRANT SELECT ON colegios TO anon, authenticated, service_role;');

        console.log('Success: Policy applied.');

    } catch (err) {
        console.error('Error applying policy:', err);
    } finally {
        await client.end();
    }
}

forceApply();
