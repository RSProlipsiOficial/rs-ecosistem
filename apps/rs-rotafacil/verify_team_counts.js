import pg from 'pg';

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';
const client = new pg.Client({ connectionString });

async function run() {
    await client.connect();

    // Rs Prólipsi ID
    const PROLIPSI_ID = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

    console.log('--- Resumo de Usuários Vinculados ao Rs Prólipsi ---');

    const res = await client.query(`
    SELECT 
      raw_user_meta_data->>'user_type' as user_type,
      raw_user_meta_data->>'tipo_usuario' as tipo_usuario,
      COUNT(*) 
    FROM auth.users 
    WHERE 
      raw_user_meta_data->>'boss_id' = $1 OR 
      raw_user_meta_data->>'sponsor_id' = $1 OR
      raw_user_meta_data->>'created_by' = $1
    GROUP BY 1, 2
  `, [PROLIPSI_ID]);

    console.log(JSON.stringify(res.rows, null, 2));

    console.log('\n--- Amostra de Metadados ---');
    const sample = await client.query(`
    SELECT email, raw_user_meta_data 
    FROM auth.users 
    WHERE 
      raw_user_meta_data->>'boss_id' = $1 OR 
      raw_user_meta_data->>'sponsor_id' = $1
    LIMIT 3
  `, [PROLIPSI_ID]);
    console.log(JSON.stringify(sample.rows, null, 2));

    await client.end();
}

run().catch(console.error);
