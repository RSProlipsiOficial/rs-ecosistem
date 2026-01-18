
const path = require('path');
// Load env from project root (apps/rs-api/.env)
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
// Use Service Role Key if available to bypass RLS, otherwise Anon Key
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase URL or Key in .env');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseKey ? '******' : 'Missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const jsonPath = path.resolve(__dirname, 'import_network.json');

const consultants = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

async function importData() {
    console.log(`🚀 Starting import of ${consultants.length} consultants...`);

    // Chunking
    const chunkSize = 1;
    for (let i = 0; i < consultants.length; i += chunkSize) {
        const chunk = consultants.slice(i, i + chunkSize);
        // Using upsert
        const { error } = await supabase.from('consultores').upsert(chunk, { onConflict: 'id' });

        if (error) {
            console.error(`❌ Error importing chunk ${i}:`, error);
        } else {
            console.log(`✅ Imported chunk ${i} to ${Math.min(i + chunkSize, consultants.length)}`);
        }
    }
    console.log('🏁 Import process finished.');
}

importData();
