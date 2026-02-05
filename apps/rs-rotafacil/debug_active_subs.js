import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres' });

async function main() {
    try {
        const res = await pool.query(`
            SELECT 
                s.user_id, 
                s.status, 
                u.email, 
                u.raw_user_meta_data->>'nome' as nome,
                u.raw_user_meta_data->>'tipo_usuario' as tipo,
                u.raw_user_meta_data->>'app' as app
            FROM public.user_subscriptions s
            JOIN auth.users u ON s.user_id = u.id
            WHERE s.status = 'active'
        `);
        console.log('Assinaturas ATIVAS encontradas:');
        res.rows.forEach(r => {
            console.log(`- ${r.nome} (${r.email}) | Tipo: ${r.tipo} | App: ${r.app} | Status DB: ${r.status}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
main();
