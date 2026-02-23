
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listTables() {
    console.log('Listing tables in public schema...');

    const { data, error } = await supabase
        .rpc('get_tables'); // Trying RPC first

    if (error) {
        // Fallback to direct query on information_schema if RPC fails (which it might if not created)
        // Supabase JS client doesn't support direct SQL on information_schema easily without RLS or specific setup usually.
        // But let's try a work-around or just list known tables if possible.
        // Actually, let's try to infer from a known table text search? 
        // No, let's try to just select from a few likely candidates:
        // 'digital_levels', 'career_plan_digital', 'niveis_digitais'

        const candidates = ['digital_levels', 'career_plan_digital', 'niveis_digitais', 'career_levels_digital'];

        for (const table of candidates) {
            const { error: err } = await supabase.from(table).select('*').limit(1);
            if (!err || err.code !== 'PGRST205') {
                console.log(`Potential Match: ${table}`);
            } else {
                console.log(`Not found: ${table}`);
            }
        }
    } else {
        console.log('Tables:', data);
    }
}

listTables();
