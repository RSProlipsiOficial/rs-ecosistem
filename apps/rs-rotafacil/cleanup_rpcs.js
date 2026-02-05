import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres' });
async function main() {
    try {
        const res = await pool.query(`
            SELECT proname, oid::regprocedure as signature
            FROM pg_proc 
            WHERE proname = 'get_admin_users_list'
        `);
        console.log('Funções encontradas:', res.rows);

        for (const row of res.rows) {
            console.log(`Dropando: DROP FUNCTION ${row.signature}`);
            await pool.query(`DROP FUNCTION ${row.signature}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
main();
