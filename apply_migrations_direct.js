import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONNECTION_STRING = "postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres";

const MIGRATIONS = [
    'supabase/migrations/005-minisite-profiles.sql',
    'supabase/migrations/006-minisite-admin-plan.sql'
];

async function run() {
    const client = new Client({
        connectionString: CONNECTION_STRING,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected!');

        for (const migrationFile of MIGRATIONS) {
            const filePath = path.resolve(__dirname, migrationFile);
            if (!fs.existsSync(filePath)) {
                console.error(`Migration file not found: ${filePath}`);
                continue;
            }
            console.log(`Applying migration: ${migrationFile}`);
            const sql = fs.readFileSync(filePath, 'utf8');
            try {
                await client.query(sql);
                console.log(`✅ Successfully applied ${migrationFile}`);
            } catch (err) {
                console.warn(`⚠️ Warning applying ${migrationFile}:`, err.message);
            }
        }

        // --- ENSURE ADMIN PROFILE EXISTS ---
        console.log('Ensuring Admin Profile exists for rsprolipsioficial@gmail.com...');
        const ensureAdminSql = `
      DO $$
      DECLARE
        target_id UUID;
      BEGIN
        SELECT id INTO target_id FROM auth.users WHERE email = 'rsprolipsioficial@gmail.com';
        
        IF target_id IS NOT NULL THEN
          INSERT INTO public.minisite_profiles (id, name, plan, updated_at)
          VALUES (target_id, 'Consultor RS', 'admin_master', now())
          ON CONFLICT (id) DO UPDATE 
          SET plan = 'admin_master', updated_at = now();
          RAISE NOTICE 'Admin profile ensured for ID: %', target_id;
        ELSE
          RAISE NOTICE 'User rsprolipsioficial@gmail.com not found in auth.users. skipping profile creation.';
        END IF;
      END $$;
    `;
        await client.query(ensureAdminSql);
        console.log('✅ Admin Profile logic executed.');

    } catch (err) {
        console.error('Database error:', err);
    } finally {
        await client.end();
    }
}

run();
