const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function listColumns() {
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT table_name, column_name 
            FROM information_schema.columns 
            WHERE table_name IN ('agenda_items', 'trainings', 'catalogs', 'download_materials')
            ORDER BY table_name, column_name;
        `);
        console.log("COLUNAS ENCONTRADAS:");
        res.rows.forEach(r => console.log(`[${r.table_name}] ${r.column_name}`));
    } catch (err) {
        console.error('Erro:', err.message);
    } finally {
        await client.end();
    }
}

listColumns();
