import pg from 'pg';

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const client = new pg.Client({ connectionString });

async function run() {
    await client.connect();

    console.log('--- Perfis de Usuário (User Profiles) ---');
    const profilesRes = await client.query("SELECT user_id, mmn_id, nome_completo, sponsor_id FROM public.user_profiles LIMIT 10");
    console.table(profilesRes.rows);

    console.log('\n--- Consultores (Source of Truth for IDs?) ---');
    const consultoresRes = await client.query("SELECT user_id, nome, email, username, login, patrocinador_id FROM public.consultores LIMIT 10");
    console.table(consultoresRes.rows);

    // Verificar o usuário logado (Beto ou RS Prólipsi)
    console.log('\n--- Usuários com nome contendo RS ou Prólipsi ---');
    const privsRes = await client.query("SELECT id, email, raw_user_meta_data->>'nome' as nome, raw_user_meta_data->>'tipo_usuario' as tipo, raw_user_meta_data->>'sponsor_id' as sponsor FROM auth.users WHERE raw_user_meta_data->>'nome' ILIKE '%Prólipsi%' OR raw_user_meta_data->>'nome' ILIKE '%Rota Fácil%'");
    console.table(privsRes.rows);

    console.log('\n--- Usuário Beto ---');
    const betoRes = await client.query("SELECT id, email, raw_user_meta_data->>'nome' as nome FROM auth.users WHERE email ILIKE '%robertojbcamargo%'");
    console.table(betoRes.rows);

    await client.end();
}

run().catch(console.error);
