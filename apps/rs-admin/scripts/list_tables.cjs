const { Client } = require('pg');

async function listAllTables() {
    const user = "postgres.rptkhrboejbwexseikuo";
    const pass = encodeURIComponent("Rspro_@$#2025");
    const host = "aws-0-sa-east-1.pooler.supabase.com";
    const port = "6543";
    const db = "postgres";
    const connectionString = `postgresql://${user}:${pass}@${host}:${port}/${db}`;

    const client = new Client({ connectionString });

    try {
        await client.connect();
        const res = await client.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename");
        console.log('--- ALL TABLES ---');
        res.rows.forEach(r => console.log(r.tablename));
        await client.end();
    } catch (err) {
        console.error('Error', err.message);
    }
}

listAllTables();
