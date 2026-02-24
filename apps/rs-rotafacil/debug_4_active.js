import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres' });

async function main() {
    try {
        const res = await pool.query(`
            SELECT 
                s.user_id, 
                u.email, 
                u.raw_user_meta_data->>'nome' as nome,
                u.raw_user_meta_data->>'tipo_usuario' as tipo,
                u.raw_user_meta_data->>'app' as app
            FROM public.user_subscriptions s
            JOIN auth.users u ON s.user_id = u.id
            WHERE s.status = 'active'
            AND (u.raw_user_meta_data->>'tipo_usuario' IN ('master', 'owner') OR u.raw_user_meta_data->>'user_type' IN ('master', 'owner'))
        `);
        console.log('Os 4 ativos atuais:');
        res.rows.forEach(r => {
            console.log(`- ${r.nome} | App: ${r.app} | Email: ${r.email}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
main();
