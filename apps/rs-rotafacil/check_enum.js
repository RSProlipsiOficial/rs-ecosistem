import pg from 'pg';

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const client = new pg.Client({ connectionString });

async function run() {
    await client.connect();
    const res = await client.query("SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'subscription_status'");
    console.log('Valores do enum subscription_status:', res.rows.map(r => r.enumlabel));

    const res2 = await client.query("SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'payment_status'");
    console.log('Valores do enum payment_status:', res2.rows.map(r => r.enumlabel));

    await client.end();
}

run().catch(console.error);
