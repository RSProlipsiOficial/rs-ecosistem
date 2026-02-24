
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connectionString = 'postgresql://postgres:Yannis784512@@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function applySql(filename) {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to Database');

        const sqlPath = path.join(__dirname, 'supabase', 'migrations', filename);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log(`Executing SQL from ${filename}...`);
        await client.query(sql);
        console.log('Final RPC Fix Applied Successfully!');

    } catch (err) {
        console.error('Error executing SQL:', err);
    } finally {
        await client.end();
    }
}

applySql('20260206_final_rpc_fix.sql');
