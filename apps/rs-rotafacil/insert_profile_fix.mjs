
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connectionString = 'postgresql://postgres:Yannis784512@@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function fixProfile() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const sqlPath = path.join(__dirname, 'insert_profile_fix.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Fixing Profile...');
    const res = await client.query(sql);
    console.log('Done!');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

fixProfile();
