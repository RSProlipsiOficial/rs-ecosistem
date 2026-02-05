import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres";

async function getRPCSrc() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        const res = await client.query(`
      SELECT prosrc FROM pg_proc WHERE proname = 'create_aluno_public';
    `);
        console.log(res.rows[0]?.prosrc);
    } catch (err) {
        console.error("ERRO:", err.message);
    } finally {
        await client.end();
    }
}

getRPCSrc();
