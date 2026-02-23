
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data, error } = await supabase
        .from('minisite_profiles')
        .select('*')
        .limit(1)
        .single();

    if (error) {
        console.error('Error fetching sample:', error);
        return;
    }

    console.log('Columns in minisite_profiles:');
    console.log(Object.keys(data).join(', '));
}

checkSchema();
