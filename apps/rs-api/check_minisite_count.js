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
        const { count, error } = await supabase.from('minisite_profiles').select('*', { count: 'exact', head: true });
        if (error) {
            console.log('Error querying minisite_profiles:', error.message);
        } else {
            console.log('minisite_profiles count:', count);
        }
    } catch (err) {
        console.error('Exception:', err);
    }
}

run();
