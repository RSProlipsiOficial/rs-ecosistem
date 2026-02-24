
import pg from 'pg';
import { fileURLToPath } from 'url';

const { Client } = pg;
const connectionString = 'postgresql://postgres:Yannis784512@@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function auditAnon() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        console.log('--- AUDITORIA DE ACESSO ANÔNIMO ---');

        // 1. Check Grant
        console.log('\n1. Checking Table Privileges (GRANT)...');
        const grants = await client.query(`
            SELECT grantee, privilege_type 
            FROM information_schema.role_table_grants 
            WHERE table_name = 'colegios' AND grantee = 'anon';
        `);
        console.table(grants.rows);

        // 2. Simulate Anon Transaction
        console.log('\n2. Simulating ANON SELECT...');
        await client.query('BEGIN');
        await client.query('SET LOCAL ROLE anon;');

        // Try simple count colegios
        const res = await client.query('SELECT count(*) FROM colegios;');
        console.log('Result colegios as ANON:', res.rows[0]);

        // Try simple count van_colegios
        const resVan = await client.query('SELECT count(*) FROM van_colegios;');
        console.log('Result van_colegios as ANON:', resVan.rows[0]);

        await client.query('ROLLBACK');
        console.log('\nStatus: SUCCESS (Anon can read)');

    } catch (err) {
        console.error('\nStatus: FAILED (Anon cannot read)');
        console.error('Error:', err.message); // Just message to be cleaner
        if (err.code) console.error('PG Code:', err.code);
        try { await client.query('ROLLBACK'); } catch (e) { }
    } finally {
        await client.end();
    }
}

auditAnon();
