const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';
const sqlFilePath = path.join(__dirname, 'supabase', 'migrations', '008-fix-communication-columns.sql');

async function applyMigration() {
    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Connecting to Supabase PostgreSQL...');
        await client.connect();
        console.log('Connected successfully!');

        console.log(`Reading SQL from ${sqlFilePath}...`);
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('Executing SQL...');
        const result = await client.query(sql);
        console.log('SQL executed successfully!');

        // Show tables to confirm
        /*
        const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables in public schema:', tables.rows.map(r => r.table_name).join(', '));
        */

    } catch (err) {
        console.error('Error applying migration:', err.message);
        if (err.detail) console.error('Detail:', err.detail);
        if (err.hint) console.error('Hint:', err.hint);
    } finally {
        await client.end();
    }
}

applyMigration();
