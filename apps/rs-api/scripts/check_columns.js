
const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const sql = `
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('catalogs', 'download_materials');
`;

async function runCheck() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('🐘 Verificando colunas...');
        const res = await client.query(sql);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('❌ Erro:', err.message);
    } finally {
        await client.end();
    }
}

runCheck();
