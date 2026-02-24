import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres' });

async function check() {
    try {
        const adminId = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
        const res = await pool.query('SELECT public.get_admin_users_list($1::uuid) as list', [adminId]);
        const list = res.rows[0].list;

        console.log('--- USUÁRIOS RETORNADOS PELA RPC CORRIGIDA ---');
        console.log('Total:', list.length);
        list.forEach(u => {
            console.log(`- ${u.nome} | Email: ${u.email} | SponsorID: ${u.raw_user_meta_data?.sponsor_id}`);
        });

    } catch (err) {
        console.error('Erro:', err);
    } finally {
        await pool.end();
    }
}

check();
