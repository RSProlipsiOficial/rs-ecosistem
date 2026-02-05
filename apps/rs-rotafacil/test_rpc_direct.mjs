import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres";

const token = "e0986e8c0e3ca4773469d9c634a052ea16e4299e2c37b3dcaa7bf31a2b77ae29";

async function testRPC() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        const res = await client.query(`
      SELECT public.get_aluno_by_update_token($1) as result;
    `, [token]);
        console.log("Resultado da RPC:", JSON.stringify(res.rows[0].result, null, 2));
    } catch (err) {
        console.error("ERRO na RPC:", err.message);
    } finally {
        await client.end();
    }
}

testRPC();
