const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/rs-api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function run() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const email = 'admin@rsprolipsi.com';

    console.log(`--- CHECANDO CONTA: ${email} ---`);

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single();

    console.log('Profile:', profile);

    const { data: consultor } = await supabase
        .from('consultores')
        .select('*')
        .eq('email', email)
        .single();

    console.log('Consultor:', consultor);
}
run();
