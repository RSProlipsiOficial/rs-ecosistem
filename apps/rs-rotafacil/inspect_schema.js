import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres' });
async function main() {
    try {
        const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tabelas:', res.rows.map(r => r.table_name).join(', '));

        // Check columns of public.alunos
        const alunosCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'alunos' AND table_schema = 'public'");
        console.log('Colunas de alunos:', alunosCols.rows.map(r => r.column_name).join(', '));

        // Check columns of public.afiliados (potential for Indicados)
        const afiliadosCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'afiliados' AND table_schema = 'public'");
        console.log('Colunas de afiliados:', afiliadosCols.rows.map(r => r.column_name).join(', '));

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
main();
