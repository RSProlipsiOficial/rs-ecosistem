import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres' });
async function main() {
    try {
        const adminId = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

        // 1. Motoristas
        const mot = await pool.query(`
            SELECT count(*) FROM auth.users 
            WHERE (raw_user_meta_data->>'sponsor_id' = $1 OR raw_user_meta_data->>'sponsor_id' = 'rsprolipsi')
            AND COALESCE(raw_user_meta_data->>'tipo_usuario', raw_user_meta_data->>'user_type') = 'motorista'
        `, [adminId]);
        console.log('Motoristas:', mot.rows[0].count);

        // 2. Monitoras
        const mon = await pool.query(`
            SELECT count(*) FROM auth.users 
            WHERE (raw_user_meta_data->>'sponsor_id' = $1 OR raw_user_meta_data->>'sponsor_id' = 'rsprolipsi')
            AND COALESCE(raw_user_meta_data->>'tipo_usuario', raw_user_meta_data->>'user_type') = 'monitora'
        `, [adminId]);
        console.log('Monitoras:', mon.rows[0].count);

        // 3. Alunos (via Vans)
        const alu = await pool.query(`
            SELECT count(*) FROM public.alunos 
            WHERE van_id IN (SELECT id FROM public.vans WHERE user_id = $1)
        `, [adminId]);
        console.log('Alunos (via Van):', alu.rows[0].count);

        // 4. Indicados (Sponsor mas não motorista/monitora)
        const ind = await pool.query(`
            SELECT count(*) FROM auth.users 
            WHERE (raw_user_meta_data->>'sponsor_id' = $1 OR raw_user_meta_data->>'sponsor_id' = 'rsprolipsi')
            AND COALESCE(raw_user_meta_data->>'tipo_usuario', raw_user_meta_data->>'user_type') NOT IN ('motorista', 'monitora')
            AND id <> $1
        `, [adminId]);
        console.log('Indicados:', ind.rows[0].count);

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
main();
