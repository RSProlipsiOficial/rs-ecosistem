
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load from apps/rs-api/.env
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing keys in .env:", { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log(`Checking DB at ${supabaseUrl.substring(0, 30)}...`);

    const { count, error } = await supabase
        .from('consultores')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log(`\n>>> TOTAL CONSULTORES IN DB: ${count} <<<\n`);
    }

    // Check specific tenant
    const { count: tCount } = await supabase
        .from('consultores')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', '523554e3-00ef-41b9-adee-a6798111ef50');

    console.log(`Tenant 523554... Count: ${tCount}`);
}

check();
