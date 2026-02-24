
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connectionString = 'postgresql://postgres:Yannis784512@@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function checkColumns() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const sqlPath = path.join(__dirname, 'supabase', 'migrations', 'check_columns.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Checking columns...');
        const res = await client.query(sql);
        console.log('Columns in public.vans:', res.rows.map(r => r.column_name));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkColumns();
