
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRoots() {
    console.log('Checking roots (handling UUID errors)...');

    // 1. Get all consultants to process locally (avoid complex SQL with mixed types)
    const { data: all, error } = await supabase
        .from('consultores')
        .select('id, nome, username, patrocinador_id');

    if (error) {
        console.error('Error fetching all:', error);
        return;
    }

    // 2. Filter roots in JS
    const roots = all.filter(c => {
        return !c.patrocinador_id ||
            c.patrocinador_id === '0' ||
            c.patrocinador_id === '' ||
            c.patrocinador_id === 0;
    });

    console.log(`Found ${roots.length} roots (local filter):`);
    roots.forEach(r => console.log(`- ${r.nome} (${r.username}) ID: ${r.id}`));
}

checkRoots();
