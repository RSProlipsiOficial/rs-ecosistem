
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function dumpDigitalLevelsCorrect() {
    console.log('Checking career_levels_digital table...');
    const { data, error } = await supabase
        .from('career_levels_digital')
        .select('*')
        .order('display_order', { ascending: true });

    if (error) {
        console.error('Error fetching career_levels_digital:', error);
    } else {
        console.log(`Found ${data.length} levels in career_levels_digital.`);
        console.log('Sample Level:', data[0]);
        const fs = require('fs');
        fs.writeFileSync('digital_levels_dump.json', JSON.stringify(data, null, 2));
        console.log('Dump saved to digital_levels_dump.json');
    }
}

dumpDigitalLevelsCorrect();
