
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkTable() {
    console.log("Checking table app_configs...");

    // Check if table exists by trying to select from it
    const { data: selectData, error: selectError } = await supabase
        .from('app_configs')
        .select('*')
        .limit(1);

    if (selectError) {
        console.error("Error selecting from app_configs:", selectError.message);
        if (selectError.code === '42P01') {
            console.log("Table 'app_configs' does NOT exist.");
        }
    } else {
        console.log("Table 'app_configs' exists. Sample data:", selectData);
    }
}

checkTable();
