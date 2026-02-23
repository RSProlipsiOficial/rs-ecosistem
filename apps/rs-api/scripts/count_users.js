
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
    console.log("Checking users for tenant 523554e3-00ef-41b9-adee-a6798111ef50...");

    // Check in profiles/minisite_profiles
    const { count, error } = await supabase
        .from('minisite_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', '523554e3-00ef-41b9-adee-a6798111ef50');

    if (error) {
        console.error("Error checking minisite_profiles:", error.message);
    } else {
        console.log(`Minisite Profiles Count: ${count}`);
    }

    // Check in users table if exists
    const { count: uCount, error: uError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    if (uError) {
        console.error("Error checking profiles:", uError.message);
    } else {
        console.log(`Total Profiles Count in DB: ${uCount}`);
    }
}

checkUsers();
