
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connectionString = 'postgresql://postgres:Yannis784512@@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function runTest() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const sqlPath = path.join(__dirname, 'test_rpc.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Testing RPC...');
        const res = await client.query(sql);
        console.log('RPC Result:', JSON.stringify(res.rows[0], null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

runTest();
