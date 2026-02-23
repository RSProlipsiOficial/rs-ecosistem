const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function describeTable() {
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'consultores' });

    if (error) {
        // If RPC doesn't exist, try fetching a single row
        console.log('RPC failed, fetching one row headers...');
        const { data: row, error: rowErr } = await supabase
            .from('consultores')
            .select('*')
            .limit(1)
            .single();

        if (rowErr) {
            console.error(rowErr);
        } else {
            console.log('Columns:', Object.keys(row));
        }
    } else {
        console.log(data);
    }
}

describeTable();
