const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';
const sqlFilePath = path.join(__dirname, '008-fix.sql');

async function applyFix() {
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting...');
        await client.connect();

        const sql = fs.readFileSync(sqlFilePath, 'utf8');
        console.log('Executing SQL...');
        await client.query(sql);
        console.log('Success!');

        // Notify PostgREST to reload schema
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log('Schema cache reloaded.');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

applyFix();
