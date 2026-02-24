import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres";

async function getHash() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        const res = await client.query(`
      SELECT encrypted_password FROM auth.users WHERE email = 'reset_test@example.com';
    `);
        console.log("Hash for 123456:", res.rows[0]?.encrypted_password);
    } catch (err) {
        console.error("ERRO:", err.message);
    } finally {
        await client.end();
    }
}

getHash();
