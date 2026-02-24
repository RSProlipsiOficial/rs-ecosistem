import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres' });
async function main() {
    try {
        const adminId = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

        // 4. Indicados (Sponsor mas não motorista/monitora)
        const ind = await pool.query(`
            SELECT count(*) FROM auth.users 
            WHERE (raw_user_meta_data->>'sponsor_id' = $1 OR raw_user_meta_data->>'sponsor_id' = 'rsprolipsi')
            AND COALESCE(raw_user_meta_data->>'tipo_usuario', raw_user_meta_data->>'user_type') NOT IN ('motorista', 'monitora')
            AND id::text <> $1
        `, [adminId]);
        console.log('Indicados:', ind.rows[0].count);

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
main();
