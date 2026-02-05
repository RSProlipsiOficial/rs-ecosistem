import pg from 'pg';

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const client = new pg.Client({ connectionString });

async function run() {
    await client.connect();

    console.log('--- Colunas de user_profiles ---');
    const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND table_schema = 'public'
  `);
    console.log(JSON.stringify(res.rows, null, 2));

    console.log('\n--- Dados de exemplo de user_profiles ---');
    const dataRes = await client.query("SELECT * FROM public.user_profiles LIMIT 5");
    console.log(JSON.stringify(dataRes.rows, null, 2));

    await client.end();
}

run().catch(console.error);
