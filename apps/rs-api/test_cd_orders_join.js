const { createClient } = require('@supabase/supabase-js');
const { config } = require('dotenv');
config({ path: '.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testJoin() {
    console.log("--- Executing query ---");
    const { data, error } = await supabase
        .from('cd_orders')
        .select('*, items:cd_order_items(*)');
    if (error) {
        console.error("ERROR:", error);
    } else {
        console.log("SUCCESS, rows:", data.length);
        if (data.length > 0) {
            console.log("First row items:", data[0].items);
        }
    }
}
testJoin();
