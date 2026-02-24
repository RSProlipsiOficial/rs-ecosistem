
import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const client = new Client({
    connectionString: connectionString,
});

async function applySql() {
    try {
        const sqlPath = path.join(__dirname, 'fix_precision_data_rpcs.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Connecting to Supabase Database...');
        await client.connect();
        console.log('Connected! Executing SQL...');

        await client.query(sql);
        console.log('SUCCESS: SQL script applied successfully to the database.');

    } catch (err) {
        console.error('ERROR applying SQL script:', err);
    } finally {
        await client.end();
    }
}

applySql();
