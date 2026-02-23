const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('--- PRODUCT COUNT BY TENANT ---');
    const { data: counts, error } = await supabase
        .from('products')
        .select('tenant_id');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    const map = {};
    counts.forEach(c => {
        map[c.tenant_id] = (map[c.tenant_id] || 0) + 1;
    });

    console.log('Tenants found:', map);
}

check();
