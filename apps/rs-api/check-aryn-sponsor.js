const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkArynSponsor() {
    try {
        const { data: aryn } = await supabase
            .from('user_profiles')
            .select('id, nome_completo, sponsor_id')
            .ilike('nome_completo', '%Aryn%');

        console.log('--- ARYN RODRIGUES ---');
        console.log(aryn);
    } catch (error) {
        console.error(error);
    }
}

checkArynSponsor();
