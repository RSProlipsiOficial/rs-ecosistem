const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function getFunctionDef() {
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT routine_definition 
            FROM information_schema.routines 
            WHERE routine_name = 'sync_user_to_network';
        `);
        console.log("DEFINIÇÃO DA FUNÇÃO:");
        console.log(res.rows[0]?.routine_definition || "Não encontrada.");
    } catch (err) {
        console.error('Erro:', err.message);
    } finally {
        await client.end();
    }
}

getFunctionDef();
