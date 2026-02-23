
const { Client } = require('pg');
require('dotenv').config();

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        // Try consultores
        try {
            const res = await client.query('SELECT id, email FROM consultores LIMIT 1');
            if (res.rows.length > 0) {
                console.log('VALID_CONSULTOR_ID:', res.rows[0].id);
                return;
            } else {
                console.log('NO_CONSULTORES_FOUND');
            }
        } catch (e) {
            console.log('Failed consultores:', e.message);
        }

        // List public tables
        const resTables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    `);
        console.log('Tables in public:', resTables.rows.map(r => r.table_name));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
