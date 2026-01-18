
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log('Inspecting consultores table...');
    const { data, error } = await supabase.from('consultores').select('*').limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        if (data.length > 0) {
            console.log('Columns:', Object.keys(data[0]));
            console.log('Sample Row:', data[0]);
        } else {
            console.log('Table is empty, cannot infer columns from data.');
            // Try to insert a dummy to see error? No.
        }
    }
}

inspect();
