require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using correct key

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log('Fetching columns...');
    // Try to fetch one row to see keys
    const { data, error } = await supabase.from('career_levels_digital').select('*').limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]));
        console.log('Sample Row:', JSON.stringify(data[0], null, 2));
    } else {
        console.log('Table is empty, cannot infer columns from data.');
        // Fallback: try to insert a dummy to get a schema error if possible, or just report empty
    }
}

inspect();
