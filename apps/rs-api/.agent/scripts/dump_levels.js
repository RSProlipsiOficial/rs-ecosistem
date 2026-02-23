
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function dumpLevels() {
    const { data, error } = await supabase
        .from('career_levels')
        .select('*')
        .order('display_order', { ascending: true });

    if (error) {
        console.error(error);
    } else {
        const fs = require('fs');
        fs.writeFileSync('levels_dump.json', JSON.stringify(data, null, 2));
        console.log('Dump saved to levels_dump.json');
    }
}

dumpLevels();
