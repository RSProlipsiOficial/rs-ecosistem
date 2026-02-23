
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkTable() {
    console.log("Checking table sigma_settings...");

    // Check if table exists by trying to select from it
    const { data: selectData, error: selectError } = await supabase
        .from('sigma_settings')
        .select('*')
        .limit(1);

    if (selectError) {
        console.error("Error selecting from sigma_settings:", selectError.message);
    } else {
        console.log("Table 'sigma_settings' exists. Sample data:", selectData);
    }
}

checkTable();
