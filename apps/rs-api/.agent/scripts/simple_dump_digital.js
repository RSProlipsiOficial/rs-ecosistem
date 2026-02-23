require('dotenv').config({ path: '../../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_service_role;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function dumpLevels() {
    const { data, error } = await supabase.from('career_levels_digital').select('*').order('level_order', { ascending: true });

    if (error) {
        console.error('Error fetching levels:', error);
        return;
    }

    console.log('Digital Career Levels:');
    console.log(JSON.stringify(data, null, 2));
}

dumpLevels();
