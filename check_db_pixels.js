
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'apps/rs-api/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in apps/rs-api/.env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
    console.log("--- Checking Tables ---");
    const { data: tables, error: tableError } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');

    if (tableError) {
        console.error("Error listing tables:", tableError);
    } else {
        console.log("Tables found:", tables.map(t => t.tablename).join(', '));
    }

    console.log("\n--- Checking 'tracking_pixels' table ---");
    const { data: tp, error: tpError } = await supabase.from('tracking_pixels').select('*').limit(1);
    if (tpError) {
        console.error("tracking_pixels error:", tpError.message);
    } else {
        console.log("tracking_pixels exists!");
    }

    console.log("\n--- Checking 'marketing_pixels' table ---");
    const { data: mp, error: mpError } = await supabase.from('marketing_pixels').select('*').limit(1);
    if (mpError) {
        console.error("marketing_pixels error:", mpError.message);
    } else {
        console.log("marketing_pixels exists!");
    }
}

checkDatabase();
