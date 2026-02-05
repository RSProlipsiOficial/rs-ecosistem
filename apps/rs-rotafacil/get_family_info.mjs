import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres";

async function getInfo() {
    const client = new Client({ connectionString });
    try {
        await client.connect();

        // Get get_my_students RPC
        const rpcRes = await client.query(`
      SELECT prosrc FROM pg_proc WHERE proname = 'get_my_students';
    `);
        console.log("--- get_my_students ---");
        console.log(rpcRes.rows[0]?.prosrc);

        // Get responsavel_alunos schema
        const schemaRes = await client.query(`
      SELECT 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        JOIN information_schema.referential_constraints AS rc
          ON rc.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'responsavel_alunos';
    `);
        console.log("\n--- responsavel_alunos constraints ---");
        console.log(JSON.stringify(schemaRes.rows, null, 2));

    } catch (err) {
        console.error("ERRO:", err.message);
    } finally {
        await client.end();
    }
}

getInfo();
