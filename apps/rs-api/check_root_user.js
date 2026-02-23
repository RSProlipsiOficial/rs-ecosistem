
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRootUser() {
    const OFFICIAL_EMAIL = 'rsprolipsioficial@gmail.com';
    const { data: root, error } = await supabase
        .from('consultores')
        .select('id, nome, email, status, pin_atual')
        .eq('email', OFFICIAL_EMAIL)
        .maybeSingle();

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (!root) {
        console.log('Root user with email rsprolipsioficial@gmail.com NOT FOUND.');

        // Try searching for any user with PROLIPSI in name
        const { data: similar } = await supabase
            .from('consultores')
            .select('id, nome, email, status')
            .ilike('nome', '%PRÓLIPSI%')
            .limit(5);

        console.log('Similar users:', similar);
    } else {
        console.log('Root user found:', root);
    }
}

checkRootUser();
