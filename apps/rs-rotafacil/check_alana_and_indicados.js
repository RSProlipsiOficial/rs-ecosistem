import pg from 'pg';

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const client = new pg.Client({ connectionString });

async function run() {
    await client.connect();

    console.log('--- Metadata da Alana ---');
    const alanaRes = await client.query("SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = 'betochamadoporjesus@gmail.com'");
    console.log(JSON.stringify(alanaRes.rows[0], null, 2));

    console.log('\n--- Registros na tabela public.indicados ---');
    const indicadosRes = await client.query("SELECT * FROM public.indicados LIMIT 10");
    console.table(indicadosRes.rows);

    // Verificar se existem usuários com tipo_usuario = 'indicado'
    console.log('\n--- Contagem por tipo_usuario em auth.users ---');
    const typesRes = await client.query("SELECT raw_user_meta_data->>'tipo_usuario' as tipo, count(*) FROM auth.users group by 1");
    console.table(typesRes.rows);

    await client.end();
}

run().catch(console.error);
