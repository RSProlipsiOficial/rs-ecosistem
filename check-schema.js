
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/rs-api/.env' });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
    console.log('Checking downlines table structure...');
    const { data, error } = await supabase
        .from('downlines')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching from downlines:', error);
    } else {
        console.log('Sample downline row:', data);
    }

    // Check columns of consultores
    const { data: consultData, error: consultError } = await supabase
        .from('consultores')
        .select('*')
        .limit(1);

    if (consultError) {
        console.error('Error fetching from consultores:', consultError);
    } else {
        console.log('Sample consultor row:', consultData);
    }
}

checkSchema();
