import pg from 'pg';
const client = new pg.Pool({
    connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres'
});

async function check() {
    try {
        const adminEmail = 'rsprolipsioficial@gmail.com';
        const res = await client.query('SELECT id FROM auth.users WHERE email = $1', [adminEmail]);
        const adminId = res.rows[0].id;

        console.log('ID do Admin:', adminId);

        const rpcRes = await client.query('SELECT public.get_admin_user_team_usage() as usage');
        const usage = rpcRes.rows[0].usage;

        console.log('--- RETORNO DA RPC PARA O ADMIN ---');
        console.log(JSON.stringify(usage[adminId], null, 2));

        // Verificar por que pode estar vindo zero
        const checkMotoristas = await client.query(`
            SELECT count(*) FROM auth.users 
            WHERE (
                raw_user_meta_data->>'sponsor_id' = $1 OR 
                raw_user_meta_data->>'sponsor_user_id' = $1 OR
                raw_user_meta_data->>'boss_id' = $1 OR 
                raw_user_meta_data->>'equipe' = $1 OR
                raw_user_meta_data->>'sponsor_id' = 'rsprolipsi'
            ) AND (
                COALESCE(raw_user_meta_data->>'tipo_usuario', raw_user_meta_data->>'user_type') = 'motorista'
            )
        `, [adminId]);
        console.log('Contagem Manual Motoristas:', checkMotoristas.rows[0].count);

        const checkAlunos = await client.query(`
            SELECT count(*) FROM public.alunos 
            WHERE created_by = $1 OR user_id = $1
        `, [adminId]);
        console.log('Contagem Manual Alunos:', checkAlunos.rows[0].count);

    } catch (err) {
        console.error('Erro:', err);
    } finally {
        await client.end();
    }
}

check();
