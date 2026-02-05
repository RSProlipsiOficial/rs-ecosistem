import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres";

async function checkHashes() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        const res = await client.query(`
      SELECT email, encrypted_password, raw_user_meta_data->>'nome' as nome
      FROM auth.users 
      ORDER BY created_at DESC 
      LIMIT 10;
    `);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error("ERRO:", err.message);
    } finally {
        await client.end();
    }
}

checkHashes();
