const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Connection string from credentials file
// postgresql://postgres:[YOUR_PASSWORD]@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres
const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const client = new Client({
    connectionString: connectionString,
});

async function runMigration() {
    try {
        await client.connect();
        console.log('Connected to Supabase Postgres!');

        // Read SQL file from rs-admin
        const sqlPath = path.resolve(__dirname, '../../apps/rs-admin/update_products_schema_v2.sql');
        console.log(`Reading SQL from: ${sqlPath}`);

        if (!fs.existsSync(sqlPath)) {
            throw new Error(`SQL file not found at ${sqlPath}`);
        }

        const sqlConfig = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL...');
        await client.query(sqlConfig);
        console.log('Migration executed successfully!');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
