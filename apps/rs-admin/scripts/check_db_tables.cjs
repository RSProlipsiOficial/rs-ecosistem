const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function run() {
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await client.connect();

    console.log('--- TABLES ---');
    const tables = await client.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
    console.table(tables.rows);

    console.log('\n--- COLUMNS for app_configs ---');
    const columns = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'app_configs'");
    console.table(columns.rows);

    console.log('\n--- CONSTRAINTS for app_configs ---');
    const constraints = await client.query("SELECT conname, contype FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid WHERE t.relname = 'app_configs'");
    console.table(constraints.rows);

    await client.end();
}

run();
