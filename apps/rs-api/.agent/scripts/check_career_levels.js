
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCareerLevels() {
    console.log('Checking career_levels table...');
    const { data, error } = await supabase
        .from('career_levels')
        .select('*')
        .order('display_order', { ascending: true });

    if (error) {
        console.error('Error fetching career_levels:', error);
    } else {
        console.log('Found', data.length, 'levels:');
        console.table(data.map(l => ({
            id: l.id,
            name: l.name,
            order: l.display_order,
            min_directs: l.required_personal_recruits,
            pv: l.required_pv,
            active: l.is_active
        })));
    }
}

checkCareerLevels();
