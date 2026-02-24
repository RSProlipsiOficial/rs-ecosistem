
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connectionString = 'postgresql://postgres:Yannis784512@@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function applyFix() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const sqlPath = path.join(__dirname, 'fix_public_access_colegios.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Applying RLS Fix for Colegios...');
        await client.query(sql);
        console.log('Fix Applied Successfully!');

    } catch (err) {
        console.error('Error applying fix:', err);
    } finally {
        await client.end();
    }
}

applyFix();
