
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connectionString = 'postgresql://postgres:Yannis784512@@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function finalFix() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const sqlPath = path.join(__dirname, 'final_fix_slug.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Applying Final Slug Fix...');
        const res = await client.query(sql);
        console.log('Success.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

finalFix();
