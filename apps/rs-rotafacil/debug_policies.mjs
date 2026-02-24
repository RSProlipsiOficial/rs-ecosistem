
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connectionString = 'postgresql://postgres:Yannis784512@@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function checkPolicies() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const sqlPath = path.join(__dirname, 'debug_policies.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Checking RLS Policies...');
        const res = await client.query(sql);
        console.log(JSON.stringify(res.rows, null, 2));

    } catch (err) {
        console.error('Error checking policies:', err);
    } finally {
        await client.end();
    }
}

checkPolicies();
