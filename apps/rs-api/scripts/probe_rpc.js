
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Check env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function probe() {
    console.log('Testing exec_sql RPC...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' });

    if (error) {
        console.log('RPC exec_sql failed:', error.message);
        // Try another common name
        console.log('Testing run_sql RPC...');
        const { data: d2, error: e2 } = await supabase.rpc('run_sql', { query: 'SELECT 1' });
        if (e2) {
            console.log('RPC run_sql failed:', e2.message);
        } else {
            console.log('✅ RPC run_sql works!');
        }
    } else {
        console.log('✅ RPC exec_sql works!');
    }
}

probe();
