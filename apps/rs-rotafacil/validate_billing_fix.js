import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres' });

async function main() {
    try {
        console.log('--- VALIDANDO RPC get_admin_billing_summary ---');
        const resSum = await pool.query("SELECT public.get_admin_billing_summary() as summary");
        console.log('Summary:', resSum.rows[0].summary);

        console.log('\n--- VALIDANDO RPC get_admin_users_list (Lista de Vendas) ---');
        const resList = await pool.query("SELECT public.get_admin_users_list(NULL) as list");
        const allUsers = resList.rows[0].list;

        const appUsers = allUsers.filter(u => {
            const uTipo = (u.tipo_usuario || '').toLowerCase();
            return ['master', 'owner'].includes(uTipo) && u.app === 'rotafacil';
        });

        console.log('Total Masters/Owners RotaFácil:', appUsers.length);

        const activeUsers = appUsers.filter(u => {
            const isOfficial = u.nome?.toLowerCase().includes('rota fácil') ||
                u.nome?.toLowerCase().includes('rota facil');
            return u.status === 'active' || u.status === 'ativo' || isOfficial;
        });

        console.log('Usuários que aparecerão no Dashboard de Vendas:', activeUsers.length);
        activeUsers.forEach(u => {
            console.log(`- ${u.nome} | Status: ${u.status} | Plan: ${u.plan_id}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
main();
