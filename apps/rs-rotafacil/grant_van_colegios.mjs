
import pg from 'pg';
import { fileURLToPath } from 'url';

const { Client } = pg;
const connectionString = 'postgresql://postgres:Yannis784512@@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function grantAccess() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        console.log('Granting SELECT on van_colegios to anon...');
        await client.query('GRANT SELECT ON van_colegios TO anon, authenticated, service_role;');

        console.log('Success: Granted.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

grantAccess();
