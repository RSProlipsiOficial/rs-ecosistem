
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkConsultants() {
    console.log('Checking consultores table...');

    // 1. Total Count
    const { count, error: countError } = await supabase
        .from('consultores')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error counting consultants:', countError);
        return;
    }
    console.log(`Total Consultants: ${count}`);

    // 2. Check Hierarchy (Root)
    const { data: roots, error: rootError } = await supabase
        .from('consultores')
        .select('id, nome, username, patrocinador_id')
        .or('patrocinador_id.is.null,patrocinador_id.eq.0,patrocinador_id.eq.""');

    if (rootError) {
        console.error('Error fetching roots:', rootError);
    } else {
        console.log(`Found ${roots.length} potential roots (no sponsor):`);
        roots.forEach(r => console.log(`- ${r.nome} (${r.username}) ID: ${r.id}`));
    }

    // 3. Check specific connectivity for a few nodes
    const { data: sample, error: sampleError } = await supabase
        .from('consultores')
        .select('id, nome, patrocinador_id')
        .not('patrocinador_id', 'is', null)
        .limit(5);

    if (sampleError) {
        console.error('Error fetching sample:', sampleError);
    } else {
        console.log('Sample links:');
        sample.forEach(s => console.log(`- ${s.nome} -> Parent: ${s.patrocinador_id}`));
    }
}

checkConsultants();
