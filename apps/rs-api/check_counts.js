const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '.env');
const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
}, {});

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const tables = ['consultores', 'wallets', 'user_profiles', 'sigma_accumulators', 'cycle_events', 'sales'];
    const counts = {};

    for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        counts[table] = error ? `Error: ${error.message}` : count;
    }

    console.log(JSON.stringify(counts, null, 2));
}

run();
