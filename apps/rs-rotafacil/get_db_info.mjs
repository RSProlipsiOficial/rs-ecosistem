import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres";

async function getRPCSrc() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        const res = await client.query(`
      SELECT routine_definition 
      FROM information_schema.routines 
      WHERE routine_name = 'create_aluno_public';
    `);
        console.log(res.rows[0]?.routine_definition);

        const res2 = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'alunos';
    `);
        console.log("\nCOLUNAS:");
        console.log(JSON.stringify(res2.rows, null, 2));

    } catch (err) {
        console.error("ERRO:", err.message);
    } finally {
        await client.end();
    }
}

getRPCSrc();
