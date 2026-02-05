import pg from 'pg';

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const client = new pg.Client({ connectionString });

async function run() {
    await client.connect();
    console.log('--- Colunas de user_subscriptions ---');
    const res = await client.query("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'user_subscriptions'");
    console.table(res.rows);

    console.log('--- Colunas de payment_history ---');
    const res2 = await client.query("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'payment_history'");
    console.table(res2.rows);

    await client.end();
}

run().catch(console.error);
