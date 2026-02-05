import pg from 'pg';
const client = new pg.Pool({
    connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres'
});

async function debug() {
    try {
        // 1. Buscar o Admin Principal
        const adminRes = await client.query(`
            SELECT id, email, raw_user_meta_data 
            FROM auth.users 
            WHERE email = 'rsprolipsioficial@gmail.com'
        `);
        const admin = adminRes.rows[0];
        console.log('--- ADMIN PRINCIPAL ---');
        console.log('ID:', admin.id);
        console.log('Email:', admin.email);
        console.log('Metadata:', JSON.stringify(admin.raw_user_meta_data));

        // 2. Buscar usuários que têm este ID como sponsor/boss/etc
        const teamRes = await client.query(`
            SELECT id, email, 
                   raw_user_meta_data->>'sponsor_id' as sponsor_id,
                   raw_user_meta_data->>'sponsor_user_id' as sponsor_user_id,
                   raw_user_meta_data->>'boss_id' as boss_id,
                   raw_user_meta_data->>'equipe' as equipe,
                   raw_user_meta_data->>'tipo_usuario' as tipo
            FROM auth.users 
            WHERE (
                raw_user_meta_data->>'sponsor_id' = $1 OR 
                raw_user_meta_data->>'sponsor_user_id' = $1 OR
                raw_user_meta_data->>'boss_id' = $1 OR 
                raw_user_meta_data->>'equipe' = $1 OR
                raw_user_meta_data->>'sponsor_id' = 'rsprolipsi'
            )
            LIMIT 10
        `, [admin.id]);

        console.log('\n--- AMOSTRA DA EQUIPE (Vínculos Diretos) ---');
        teamRes.rows.forEach(row => {
            console.log(`- ${row.email} | Tipo: ${row.tipo} | SponsorID: ${row.sponsor_id} | Boss: ${row.boss_id}`);
        });

        // 3. Contagem Total por Categoria
        const countsRes = await client.query(`
            SELECT 
                COALESCE(raw_user_meta_data->>'tipo_usuario', raw_user_meta_data->>'user_type') as tipo,
                count(*)
            FROM auth.users 
            WHERE (
                raw_user_meta_data->>'sponsor_id' = $1 OR 
                raw_user_meta_data->>'sponsor_user_id' = $1 OR
                raw_user_meta_data->>'boss_id' = $1 OR 
                raw_user_meta_data->>'equipe' = $1 OR
                raw_user_meta_data->>'sponsor_id' = 'rsprolipsi'
            )
            GROUP BY 1
        `, [admin.id]);

        console.log('\n--- CONTAGEM TOTAL POR TIPO ---');
        countsRes.rows.forEach(row => {
            console.log(`${row.tipo || 'DESCONHECIDO'}: ${row.count}`);
        });

    } catch (err) {
        console.error('Erro na depuração:', err);
    } finally {
        await client.end();
    }
}

debug();
