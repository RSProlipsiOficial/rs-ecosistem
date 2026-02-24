import pg from 'pg';

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const client = new pg.Client({ connectionString });

async function run() {
    await client.connect();

    console.log('--- Resumo de user_subscriptions ---');
    const res = await client.query("SELECT status, count(*) FROM public.user_subscriptions GROUP BY status");
    console.table(res.rows);

    console.log('--- Buscando tabelas de pagamento relevantes ---');
    const res2 = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND (table_name ILIKE '%pay%' OR table_name ILIKE '%transac%' OR table_name ILIKE '%venda%')");
    console.log('Tabelas encontradas:', res2.rows.map(r => r.table_name));

    await client.end();
}

run().catch(console.error);
