import pg from 'pg';
import fs from 'fs';

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const client = new pg.Client({ connectionString });

async function run() {
    await client.connect();

    const sql = fs.readFileSync('update_team_usage_v4.sql', 'utf8');
    await client.query(sql);
    console.log('RPC get_admin_user_team_usage atualizada com sucesso!');

    await client.end();
}

run().catch(console.error);
