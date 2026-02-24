import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres' });
async function main() {
    try {
        const vansCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'vans' AND table_schema = 'public'");
        console.log('Colunas de vans:', vansCols.rows.map(r => r.column_name).join(', '));

        const res = await pool.query("SELECT * FROM public.vans LIMIT 1");
        console.log('Exemplo Van:', res.rows[0]);

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
main();
