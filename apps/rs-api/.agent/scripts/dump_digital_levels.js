
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function dumpDigitalLevels() {
    console.log('Checking digital_career_levels table...');
    const { data, error } = await supabase
        .from('digital_career_levels') // Guessing table name, will fail if wrong
        .select('*')
        .order('display_order', { ascending: true });

    if (error) {
        console.error('Error fetching digital_career_levels:', error);
        // Provide list of tables to help debugging if this fails
        const { data: tables } = await supabase
            .rpc('get_tables'); // Assuming a helper RPC exists, or just fail
    } else {
        console.log(`Found ${data.length} digital levels.`);
        const fs = require('fs');
        fs.writeFileSync('digital_levels_dump.json', JSON.stringify(data, null, 2));
        console.log('Dump saved to digital_levels_dump.json');
    }
}

dumpDigitalLevels();
