import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres";

const token = "e0986e8c0e3ca4773469d9c634a052ea16e4299e2c37b3dcaa7bf31a2b77ae29";

async function debugToken() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        const res = await client.query(`
      SELECT * FROM public.aluno_update_tokens WHERE token = $1;
    `, [token]);

        if (res.rows.length === 0) {
            console.log("Token não encontrado no banco de dados.");
            // Buscar últimos tokens criados para ver se há algum
            const lastTokens = await client.query(`SELECT token, used, expires_at, created_at FROM public.aluno_update_tokens ORDER BY created_at DESC LIMIT 5;`);
            console.log("Últimos 5 tokens criados:", JSON.stringify(lastTokens.rows, null, 2));
        } else {
            console.log("Token encontrado:", JSON.stringify(res.rows[0], null, 2));
            const now = new Date();
            const expiresAt = new Date(res.rows[0].expires_at);
            console.log("Agora:", now.toISOString());
            console.log("Expira em:", expiresAt.toISOString());
            console.log("Usado:", res.rows[0].used);
            console.log("Válido?", !res.rows[0].used && expiresAt > now);
        }
    } catch (err) {
        console.error("ERRO:", err.message);
    } finally {
        await client.end();
    }
}

debugToken();
