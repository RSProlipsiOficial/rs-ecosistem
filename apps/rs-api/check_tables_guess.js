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
    try {
        // Query information_schema.tables via a direct RPC if possible, OR try to guess common table names
        // Since we can't run arbitrary SQL via client logic easily without RPC, we will try to list tables if we have a function for it.
        // If not, I will try to select from a few likely candidates for high volume data.

        const tables = ['leads', 'customers', 'orders', 'sales_history', 'audit_logs', 'notifications', 'products', 'marketing_campaigns'];

        for (const table of tables) {
            const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
            console.log(`Table '${table}': ${error ? error.message : count}`);
        }

    } catch (err) {
        console.error('Exception:', err);
    }
}

run();
