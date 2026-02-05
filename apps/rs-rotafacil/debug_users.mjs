import pg from 'pg';

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function debug() {
    const client = new pg.Client({ connectionString });
    try {
        await client.connect();
        const res = await client.query("SELECT id, email, raw_user_meta_data->>'app' as app, raw_user_meta_data->>'tipo_usuario' as tipo, raw_user_meta_data->>'status' as status_meta FROM auth.users WHERE raw_user_meta_data->>'tipo_usuario' IN ('master', 'owner')");
        console.log('Total Masters/Owners:', res.rows.length);
        console.log('Amostra:', JSON.stringify(res.rows.slice(0, 10), null, 2));
    } catch (err) {
        console.error('ERRO:', err.message);
    } finally {
        await client.end();
    }
}

debug();
