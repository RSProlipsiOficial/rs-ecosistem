import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres";

async function getRPCSrc() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        const res = await client.query(`
      SELECT 
        (SELECT jsonb_agg(jsonb_build_object('id', id, 'nome', nome)) FROM public.colegios) as colegios,
        (SELECT jsonb_agg(table_name) FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%colegio%') as colegios_tables;
    `);
        console.log(JSON.stringify(res.rows[0], null, 2));
    } catch (err) {
        console.error("ERRO:", err.message);
    } finally {
        await client.end();
    }
}

getRPCSrc();
