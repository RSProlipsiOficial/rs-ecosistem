
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
    console.log('\n--- INSPECTING SCHEMA ---');

    console.log('[1] user_profiles columns:');
    const { data: users, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1);

    if (userError) console.error(userError.message);
    else if (users.length > 0) console.log(Object.keys(users[0]));
    else console.log('No data in user_profiles to inspect.');

    console.log('\n[2] minisite_profiles columns:');
    const { data: minis, error: miniError } = await supabase
        .from('minisite_profiles')
        .select('*')
        .limit(1);

    if (miniError) console.error(miniError.message);
    else if (minis.length > 0) console.log(Object.keys(minis[0]));
    else console.log('No data in minisite_profiles to inspect.');
}

inspectSchema();
