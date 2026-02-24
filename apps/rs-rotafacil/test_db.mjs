import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres:Yannis784512@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres";

async function testConn() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log("Conectado!");
        const res = await client.query('SELECT current_database()');
        console.log(res.rows[0]);
    } catch (err) {
        console.error("ERRO:", err.message);
    } finally {
        await client.end();
    }
}

testConn();
