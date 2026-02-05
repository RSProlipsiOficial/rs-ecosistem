import pg from 'pg';
const client = new pg.Pool({
    connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres'
});

async function debugData() {
    try {
        console.log('--- USER TYPE SEARCH ---');
        const userTypes = await client.query(`
            SELECT DISTINCT 
                raw_user_meta_data->>'tipo_usuario' as meta_tipo,
                raw_user_meta_data->>'user_type' as meta_user_type,
                raw_user_meta_data->>'role' as meta_role,
                count(*)
            FROM auth.users
            GROUP BY 1, 2, 3
        `);
        console.table(userTypes.rows);

        console.log('\n--- SPONSORSHIP CHECK (ADMIN) ---');
        const sponsorCheck = await client.query(`
            SELECT 
                raw_user_meta_data->>'tipo_usuario' as tipo,
                raw_user_meta_data->>'sponsor_id' as sponsor,
                raw_user_meta_data->>'sponsor_user_id' as sponsor_uid,
                count(*)
            FROM auth.users
            WHERE raw_user_meta_data->>'sponsor_id' = 'rsprolipsi'
               OR raw_user_meta_data->>'sponsor_user_id' = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef'
            GROUP BY 1, 2, 3
        `);
        console.table(sponsorCheck.rows);

        console.log('\n--- ADMIN USER DATA ---');
        const admin = await client.query(`
            SELECT id, email, raw_user_meta_data 
            FROM auth.users 
            WHERE email = 'rsprolipsioficial@gmail.com'
        `);
        console.log(JSON.stringify(admin.rows[0], null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

debugData();
