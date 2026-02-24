import pg from 'pg';

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function find() {
    const client = new pg.Client({ connectionString });
    try {
        await client.connect();
        const res = await client.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'payment_history'");
        console.log('Resultados:', JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('ERRO:', err.message);
    } finally {
        await client.end();
    }
}

find();
