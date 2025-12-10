
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'g:\\Rs  Ecosystem\\rs-ecosystem\\apps\\rs-api\\.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    const { data, error } = await supabase.from('career_levels').select('*').limit(1);
    if (error) {
        console.log('Error accessing career_levels:', error.message);
        if (error.message.includes('does not exist')) {
            console.log('Creating career_levels table...');
            const { error: createError } = await supabase.rpc('create_career_levels_if_not_exists');
            // If RPC doesn't exist, we might need to use raw SQL if enabled, or just report it.
            // Since we can't easily run raw SQL without an RPC wrapper in Supabase-js unless enabled,
            // we will try to rely on the user running SQL if this fails.
            // But wait, I can use the `execute-sql.ts` logic if I have it.
        }
    } else {
        console.log('Table career_levels exists. Rows:', data.length);
    }
}

checkTable();
