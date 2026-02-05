import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres' });

async function main() {
    try {
        const res = await pool.query(`
            SELECT 
                id, 
                email, 
                raw_user_meta_data->>'nome' as nome,
                raw_user_meta_data->>'status' as status,
                raw_user_meta_data->>'app' as app,
                raw_user_meta_data->>'tipo_usuario' as tipo,
                raw_user_meta_data->>'plan_id' as plan_id
            FROM auth.users
            WHERE (raw_user_meta_data->>'app' = 'rotafacil')
            AND (raw_user_meta_data->>'tipo_usuario' IN ('master', 'owner'))
        `);
        console.log('Usuários RotaFácil (Master/Owner):');
        res.rows.forEach(u => {
            console.log(`- ${u.nome} (${u.email}) | Status: ${u.status} | Plan: ${u.plan_id}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
main();
