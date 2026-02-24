
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connectionString = 'postgresql://postgres:Yannis784512@@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function checkProfiles() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const sqlPath = path.join(__dirname, 'check_profiles.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Checking profiles...');
        const res = await client.query(sql);
        // client.query returns result of LAST statement if simple query string, 
        // BUT pg might behave differently. 
        // Let's rely on logging rows.
        if (Array.isArray(res)) {
            res.forEach((r, i) => console.log(`Query ${i + 1}:`, r.rows));
        } else {
            console.log('Result:', res.rows);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkProfiles();
