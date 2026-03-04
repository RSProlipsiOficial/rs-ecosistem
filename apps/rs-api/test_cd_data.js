const { createClient } = require('@supabase/supabase-js');
const { config } = require('dotenv');
config({ path: '.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkData() {
    console.log("--- Checking CDs ---");
    const { data: profiles, error: err1 } = await supabase.from('minisite_profiles').select('id, name, type').limit(3);
    console.log("Profiles:", profiles);

    console.log("\n--- Checking CD Orders ---");
    const { data: orders, error: err2 } = await supabase.from('cd_orders').select('*').limit(3);
    console.log("Orders:", orders);

    console.log("\n--- Checking CD Products ---");
    const { data: products, error: err3 } = await supabase.from('cd_products').select('id, cd_id, name, stock_level').limit(3);
    console.log("Products:", products);
}

checkData();
