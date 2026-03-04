
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking products...");
    const { data: products, error: pError } = await supabase.from('products').select('id, name').limit(5);
    console.log("Products:", products?.length || 0, pError || "");

    console.log("Checking orders...");
    const { data: orders, error: oError } = await supabase.from('cd_orders').select('id, cd_id, created_at').limit(5);
    console.log("Orders:", orders?.length || 0, oError || "");
    if (orders) console.log("Recent Orders IDs/CD_IDs:", orders.map(o => `${o.id} / ${o.cd_id}`));

    console.log("Checking minisite_profiles...");
    const { data: profiles, error: prError } = await supabase.from('minisite_profiles').select('id, name, consultant_id, type');
    console.log("Profiles:", profiles?.length || 0, prError || "");
    if (profiles) console.log("Profiles list:", profiles.map(p => `${p.name} (ID: ${p.id} / ConsId: ${p.consultant_id} / Type: ${p.type})`));
}

check();
