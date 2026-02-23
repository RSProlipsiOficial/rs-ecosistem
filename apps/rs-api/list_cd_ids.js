const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCDs() {
    console.log('--- CDS IN minisite_profiles ---');
    const { data: cds, error } = await supabase
        .from('minisite_profiles')
        .select('id, name, type')
        .or('type.ilike.cd,type.ilike.franquia,type.ilike.proprio,type.ilike.hibrido,type.ilike.%sede%');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    cds.forEach(cd => {
        console.log(`[${cd.type}] ${cd.name}: ${cd.id}`);
    });
}

checkCDs();
