import pg from 'pg';

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const client = new pg.Client({ connectionString });

async function run() {
    await client.connect();

    const tables = ['payment_history', 'payment_transactions', 'user_subscriptions', 'subscriptions'];
    for (const table of tables) {
        try {
            const res = await client.query(`SELECT count(*) FROM public.${table} LIMIT 1`);
            console.log(`Tabela public.${table} existe. Contagem: ${res.rows[0].count}`);
        } catch (e) {
            console.log(`Tabela public.${table} NÃO existe.`);
        }
    }

    await client.end();
}

run().catch(console.error);
