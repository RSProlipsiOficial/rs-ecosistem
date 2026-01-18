
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRoot() {
    console.log('Fetching consultants...');
    const { data: root, error } = await supabase
        .from('consultores')
        .select('*')
        .limit(5);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Consultants Sample:', root);
    }
}

checkRoot();
