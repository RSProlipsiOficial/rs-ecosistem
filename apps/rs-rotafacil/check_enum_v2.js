import pg from 'pg';

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const client = new pg.Client({ connectionString });

async function run() {
    await client.connect();
    console.log('--- Valores do enum subscription_v2_status ---');
    const res = await client.query("SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'subscription_v2_status'");
    console.log(res.rows.map(r => r.enumlabel));

    console.log('--- Tabelas existentes ---');
    const res2 = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log(res2.rows.map(r => r.table_name));

    await client.end();
}

run().catch(console.error);
