const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Yannis784512@@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function reload() {
    try {
        await client.connect();
        console.log('Connected to DB');
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log('Cache de schema do Supabase recarregado com sucesso!');
    } catch (e) {
        console.error('Erro:', e);
    } finally {
        await client.end();
    }
}
reload();
