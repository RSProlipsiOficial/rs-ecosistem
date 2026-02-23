const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';
const sqlFilePath = path.join(__dirname, '..', '..', 'supabase', 'migrations', '20260128_fix_user_profiles_columns.sql');

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
        // O pg client query não suporta múltiplos statements em uma única chamada se houver parâmetros, 
        // mas o raw SQL sem parâmetros deve funcionar. Se não, quebramos por ';'
        await client.query(sql);
        console.log('SQL executed successfully!');

    } catch (err) {
        console.error('Error applying migration:', err.message);
        if (err.detail) console.error('Detail:', err.detail);
        if (err.hint) console.error('Hint:', err.hint);
    } finally {
        await client.end();
    }
}

applyMigration();
