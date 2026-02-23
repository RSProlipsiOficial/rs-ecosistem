
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log('--- Inspecting User Identity ---');
    const userId = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

    // Check user_profiles
    const { data: profile, error: pErr } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (pErr) console.error('User Profiles Error:', pErr);
    else {
        console.log('Profile Keys:', Object.keys(profile));
        console.log('Profile ID (id):', profile.id);
        console.log('Profile user_id:', profile.user_id);
    }

    // Check consultores
    const { data: consultor } = await supabase
        .from('consultores')
        .select('id, user_id, nome, username')
        .eq('user_id', userId)
        .maybeSingle();

    console.log('Consultores ID:', consultor?.id);
}

inspect();
