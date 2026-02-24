import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres";

async function checkVansCols() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vans' AND table_schema = 'public';
    `);
        console.log("Colunas da tabela VANS:", JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error("ERRO:", err.message);
    } finally {
        await client.end();
    }
}

checkVansCols();
