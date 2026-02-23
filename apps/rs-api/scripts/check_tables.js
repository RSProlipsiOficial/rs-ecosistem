
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL; // Try both
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'Has Key' : 'Missing Key');

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable(tableName) {
    console.log(`Checking table: ${tableName}`);
    const { data, error } = await supabase.from(tableName).select('count', { count: 'exact', head: true });

    if (error) {
        console.error(`Error checking ${tableName}:`, error.message);
    } else {
        // If head: true, data is null, count is set.
        // But older supabase versions might return data as empty array.
        console.log(`Table ${tableName} exists.`);
    }
}

async function run() {
    await checkTable('download_materials');
    await checkTable('catalogs');
    await checkTable('treinamento_modulos');
}

run();
