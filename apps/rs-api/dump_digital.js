require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials missing');
    console.log('URL:', supabaseUrl ? 'Set' : 'Missing');
    console.log('Key:', supabaseKey ? 'Set' : 'Missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function dumpLevels() {
    console.log('Fetching levels...');
    const { data, error } = await supabase.from('career_levels_digital').select('*').order('display_order', { ascending: true });

    if (error) {
        console.error('Error fetching levels:', error);
        return;
    }

    console.log('Digital Career Levels:');
    console.log(JSON.stringify(data, null, 2));
}

dumpLevels();
