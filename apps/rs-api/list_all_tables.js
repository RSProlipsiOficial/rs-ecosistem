const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
}, {});

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    // Try to list tables via a query
    const { data, error } = await supabase.rpc('get_tables'); // Hope this exists
    if (error) {
        console.log("RPC get_tables failed, trying raw query...");
        // Fallback: Try to guess or use a common table to see if we can access pg_catalog
        const { data: tables, error: err2 } = await supabase.from('pg_catalog.pg_tables').select('tablename').eq('schemaname', 'public');
        if (err2) {
            console.log("Failed to list tables:", err2.message);
        } else {
            console.log(JSON.stringify(tables, null, 2));
        }
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
}

run();
