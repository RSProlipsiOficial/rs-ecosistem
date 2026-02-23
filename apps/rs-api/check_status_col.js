
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStatusColumn() {
    const { data, error } = await supabase
        .from('minisite_profiles')
        .select('status')
        .limit(1);

    if (error) {
        console.log('Column "status" seems missing. Error:', error.message);
    } else {
        console.log('Column "status" exists. Sample data:', data);
    }
}

checkStatusColumn();
