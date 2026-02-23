const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function checkProducts() {
    const { data, error } = await supabase.from('products').select('id, name, tenant_id').limit(5);
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Products found:', data);
    }
}

checkProducts();
