require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTree() {
    console.log('\n--- Checking Network Tree Structure ---');

    // 1. Check Roots (No sponsor)
    const { count: roots, error: rootError } = await supabase
        .from('consultores')
        .select('*', { count: 'exact', head: true })
        .is('patrocinador_id', null);

    if (rootError) console.error('Error fetching roots:', rootError);
    else console.log('Root Consultants (No Sponsor):', roots);

    // 2. Check Children (Has sponsor)
    const { count: children, error: childError } = await supabase
        .from('consultores')
        .select('*', { count: 'exact', head: true })
        .not('patrocinador_id', 'is', null);

    if (childError) console.error('Error fetching children:', childError);
    else console.log('Child Consultants (Has Sponsor):', children);

    // 3. Check specific root (Admin/Master)
    // Assuming ID 1 or similar is root
    const { data: specificRoot, error: specificError } = await supabase
        .from('consultores')
        .select('id, nome, patrocinador_id')
        .or('id.eq.1,id.eq.2,pin.eq.Admin,pin.eq.Master')
        .limit(5);

    if (specificError) console.error('Error fetching specific roots:', specificError);
    else console.log('Potential Roots found:', specificRoot);
}

checkTree();
