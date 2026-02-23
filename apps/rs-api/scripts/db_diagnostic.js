
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ SUPABASE_URL and KEY missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
    console.log('🔍 Checking Database State...');

    const tables = [
        'consultores',
        'users',
        'cycles',
        'bonuses',
        'wallets',
        'wallet_transactions',
        'distribution_centers',
        'product_catalog',
        'sales',
        'consultant_network',
        'consultant_performance',
        'sigma_settings'
    ];

    for (const table of tables) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.log(`❌ Table [${table}]: Error - ${error.message}`);
        } else {
            console.log(`✅ Table [${table}]: ${count} rows`);
        }
    }

    // Check Hierarchy
    console.log('\n🔍 Checking Consultant Hierarchy...');
    const { data: root, error: rootError } = await supabase
        .from('consultores')
        .select('id, nome, patrocinador_id')
        .is('patrocinador_id', null)
        .limit(5);

    if (rootError) {
        console.error('❌ Error fetching root consultants:', rootError.message);
    } else {
        console.log(`✅ Root Consultants (patrocinador_id is null): ${root.length}`);
        root.forEach(r => console.log(`   - ${r.nome} (ID: ${r.id})`));
    }

    const { data: orphans, error: orphanError } = await supabase
        .from('consultores')
        .select('nome, patrocinador_id')
        .not('patrocinador_id', 'is', null)
        .limit(10);

    if (!orphanError && orphans.length > 0) {
        console.log(`✅ Sample Consultants with Sponsors: ${orphans.length}`);
    }
}

checkDatabase();
