import pg from 'pg';

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const client = new pg.Client({ connectionString });

async function run() {
    await client.connect();

    const tables = ['transactions', 'wallet_transactions', 'payment_transactions'];
    for (const table of tables) {
        try {
            const res = await client.query(`SELECT count(*) FROM public.${table}`);
            console.log(`Tabela public.${table} - Contagem: ${res.rows[0].count}`);
            if (res.rows[0].count > 0) {
                const data = await client.query(`SELECT * FROM public.${table} LIMIT 2`);
                console.log(`Amostra de public.${table}:`, JSON.stringify(data.rows, null, 2));
            }
        } catch (e) {
            console.log(`Erro ao acessar public.${table}:`, e.message);
        }
    }

    await client.end();
}

run().catch(console.error);
