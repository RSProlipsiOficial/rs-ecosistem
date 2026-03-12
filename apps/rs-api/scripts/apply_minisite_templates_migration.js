const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';
const sqlPath = path.resolve(__dirname, '../../../supabase/migrations/20260310_minisite_templates.sql');

async function applyMigration() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('[minisite_templates] Connecting to Supabase Postgres...');
    await client.connect();

    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Migration file not found: ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('[minisite_templates] Applying migration...');
    await client.query(sql);

    const verify = await client.query(`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_name = 'minisite_templates'
    `);

    if (verify.rows.length === 0) {
      throw new Error('minisite_templates table was not found after migration');
    }

    console.log('[minisite_templates] Migration applied successfully.');
  } catch (error) {
    console.error('[minisite_templates] Migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

applyMigration();
