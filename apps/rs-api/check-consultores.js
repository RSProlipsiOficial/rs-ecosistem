
const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';
const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function run() {
    try {
        await client.connect();

        // 1. Estrutura de consultores
        const cols = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'consultores' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
        console.log('=== COLUNAS DE consultores ===');
        cols.rows.forEach(c => console.log(`  ${c.column_name} (${c.data_type}) nullable=${c.is_nullable}`));

        // 2. Exemplo de consultor
        const sample = await client.query('SELECT id, email, user_id, name FROM consultores LIMIT 3');
        console.log('\n=== AMOSTRA consultores ===');
        sample.rows.forEach(r => console.log(r));

        // 3. Verificar se auth.users.id == consultores.user_id ou consultores.id
        const authSample = await client.query('SELECT id, email FROM auth.users LIMIT 3');
        console.log('\n=== AMOSTRA auth.users ===');
        authSample.rows.forEach(r => console.log(r));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
