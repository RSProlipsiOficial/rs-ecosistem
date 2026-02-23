const { createClient } = require('@supabase/supabase-js');

const URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(URL, KEY);

async function inspectLocal() {
    const userId = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
    const { data: profile } = await supabase.from('user_profiles').select('*').eq('user_id', userId).maybeSingle();
    console.log("PROFILE LOCAL:", JSON.stringify(profile, null, 2));
}

inspectLocal();
