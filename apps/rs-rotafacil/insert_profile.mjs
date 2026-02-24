
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connectionString = 'postgresql://postgres:Yannis784512@@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

async function insertProfile() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const sqlPath = path.join(__dirname, 'insert_profile.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Inserting profile...');
    const res = await client.query(sql);
    console.log('Rows Inserted:', res.rowCount);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

insertProfile();
