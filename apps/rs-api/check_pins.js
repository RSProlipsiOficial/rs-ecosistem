require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPins() {
    console.log('\n--- Checking PINs in DB ---');

    const { data, error } = await supabase
        .from('consultores')
        .select('id, nome, pin_atual')
        .not('pin_atual', 'is', null) // Check not nulls
        .limit(20);

    if (error) console.error('Error fetching PINs:', error);
    else {
        console.log('Sample of consultants with PINs:', data);
        const { count } = await supabase.from('consultores').select('*', { count: 'exact', head: true }).not('pin_atual', 'is', null);
        console.log('Total consultants with explicit PIN:', count);
    }
}

checkPins();
