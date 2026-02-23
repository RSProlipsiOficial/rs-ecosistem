const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function diag() {
    console.log('--- MINIMAL INSERT DIAGNOSTIC ---');
    const tid = '00000000-0000-0000-0000-000000000000';

    // Attempt insert without ID to see if it auto-generates
    const { data, error } = await supabase.from('products').insert({
        tenant_id: tid,
        name: 'Diag Product ' + Date.now(),
        price: 100.00,
        sku: 'DIAG-' + Date.now()
    }).select();

    if (error) {
        console.log('Insert FAILED:', error.message);
        if (error.details) console.log('Details:', error.details);
    } else {
        console.log('Insert SUCCEEDED!');
        console.log('Generated Row:', data[0]);
        console.log('COLUMNS FOUND:', Object.keys(data[0]).join(', '));
    }
}

diag();
