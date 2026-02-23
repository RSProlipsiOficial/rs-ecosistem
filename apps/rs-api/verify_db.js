
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function check() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        console.error('Missing credentials');
        process.exit(1);
    }

    const supabase = createClient(url, key);

    console.log('--- Checking tables ---');
    const { data: tables, error: tableError } = await supabase
        .from('app_configs')
        .select('key, value')
        .limit(1);

    if (tableError) {
        console.error('Error accessing app_configs:', tableError.message);
        if (tableError.code === '42P01') {
            console.log('TABLE app_configs DOES NOT EXIST');
        }
    } else {
        console.log('Table app_configs exists.');
        console.log('Sample data:', tables);
    }

    const { data: cols, error: colError } = await supabase.rpc('get_table_columns', { table_name: 'app_configs' });
    if (colError) {
        console.log('RPC get_table_columns not available, trying direct query on information_schema...');
        const { data: info, error: infoError } = await supabase.rpc('inspect_table', { table_name: 'app_configs' });
        // falling back to simple query if possible
    }
}

check();
