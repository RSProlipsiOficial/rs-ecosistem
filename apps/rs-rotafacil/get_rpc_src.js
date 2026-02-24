import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres' });

async function main() {
    try {
        const res = await pool.query("SELECT proname, prosrc FROM pg_proc WHERE proname = 'get_admin_billing_summary'");
        console.log('--- RPC get_admin_billing_summary ---');
        console.log(res.rows[0]?.prosrc);

        const res2 = await pool.query("SELECT proname, prosrc FROM pg_proc WHERE proname = 'get_admin_users_list' AND proargtypes::regtype[] = ARRAY['uuid']::regtype[]");
        console.log('\n--- RPC get_admin_users_list (uuid) ---');
        console.log(res2.rows[0]?.prosrc);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
main();
