import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
// Using the service role key from the root .env to check the actual state
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function verify() {
    console.log('--- Verifying Tables on Central Supabase ---');

    // Check user_profiles
    const { data: userProfiles, error: err1 } = await supabase.from('user_profiles').select('count', { count: 'exact', head: true });
    if (err1) {
        console.log('user_profiles error:', err1.message);
    } else {
        console.log('user_profiles exists, count:', userProfiles);
    }

    // Check minisite_profiles
    const { data: minisiteProfiles, error: err2 } = await supabase.from('minisite_profiles').select('count', { count: 'exact', head: true });
    if (err2) {
        console.log('minisite_profiles error:', err2.message);
    } else {
        console.log('minisite_profiles exists, count:', minisiteProfiles);
    }

    // List all tables (hacky way via RPC or just trying common names)
    // Actually, let's try to fetch a row from user_profiles to see columns if it exists
    if (!err1) {
        const { data: row } = await supabase.from('user_profiles').select('*').limit(1);
        console.log('user_profiles sample:', row);
    }
}

verify();
