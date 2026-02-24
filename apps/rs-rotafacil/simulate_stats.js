import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres' });

async function main() {
    try {
        const { rows: users } = await pool.query(`
            SELECT 
                id, 
                raw_user_meta_data->>'nome' as nome,
                raw_user_meta_data->>'status' as status,
                raw_user_meta_data->>'tipo_usuario' as tipo,
                raw_user_meta_data->>'app' as app,
                raw_user_meta_data->>'plan_id' as plan_id
            FROM auth.users
        `);

        const formattedUsers = users
            .filter(u => {
                const uTipo = (u.tipo || u.tipo_usuario || '').toLowerCase();
                const uApp = u.app || null;
                return ['master', 'owner'].includes(uTipo) && uApp === 'rotafacil';
            })
            .map(u => {
                const isOfficial = u.nome?.toLowerCase().includes('rota fácil') ||
                    u.nome?.toLowerCase().includes('rota facil');

                // CRITÉRIO ATUAL (COM BUG)
                const isActiveOld = u.status === 'active' || u.status === 'ativo' || isOfficial;

                // CRITÉRIO NOVO (REFINADO)
                // Somente se for ativo, não for degustação/trial, e tiver plano (exceto oficiais)
                const isActiveNew = (u.status === 'active' || u.status === 'ativo') &&
                    (u.plan_id !== null || isOfficial);

                return { ...u, isActiveOld, isActiveNew };
            });

        console.log('Total de Masters/Owners RotaFácil:', formattedUsers.length);
        console.log('Ativos (Lógica Antiga):', formattedUsers.filter(u => u.isActiveOld).length);
        console.log('Ativos (Lógica Nova):', formattedUsers.filter(u => u.isActiveNew).length);

        console.log('\nDetalhamento:');
        formattedUsers.forEach(u => {
            console.log(`- ${u.nome} | Status: ${u.status} | Plan: ${u.plan_id} | OldAtivo: ${u.isActiveOld} | NewAtivo: ${u.isActiveNew}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
main();
