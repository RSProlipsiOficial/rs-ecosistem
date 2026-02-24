import pg from 'pg';

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const client = new pg.Client({ connectionString });

async function run() {
    await client.connect();

    const tables = ['user_profiles', 'consultores', 'indicados'];

    for (const table of tables) {
        console.log(`\n--- Colunas de ${table} ---`);
        const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = '${table}' AND table_schema = 'public'
    `);
        console.table(res.rows);
    }

    await client.end();
}

run().catch(console.error);
