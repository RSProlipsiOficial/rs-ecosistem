require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('='.repeat(80));
console.log('DYNAMIC CONFIG VALIDATION - PHASE D');
console.log('Checking for duplicate tables and migration conflicts');
console.log('='.repeat(80));
console.log();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableExists(tableName) {
    try {
        const { error } = await supabase.from(tableName).select('*').limit(1);
        return !error || error.code !== 'PGRST204';
    } catch (e) {
        return false;
    }
}

async function checkDuplicates() {
    const expectedTables = [
        'sigma_settings',
        'sigma_depth_levels',
        'sigma_fidelity_levels',
        'sigma_top10_levels',
        'sigma_career_pins',
        'logistics_orders',
        'cycles',
        'wallets',
        'wallet_transactions'
    ];

    console.log('📋 Checking expected tables:');
    console.log('-'.repeat(80));

    for (const table of expectedTables) {
        const exists = await checkTableExists(table);
        const status = exists ? '✅ EXISTS' : '❌ MISSING';
        console.log(`${status}\t${table}`);
    }
    console.log();

    console.log('🔍 Looking for potentially duplicate tables:');
    console.log('-'.repeat(80));

    const potentialDuplicates = [
        'sigma_settings_1',
        'sigma_settings_backup',
        'sigma_config',
        'config_settings',
        'logistics_orders_1',
        'cycles_1'
    ];

    let foundDuplicates = false;
    for (const table of potentialDuplicates) {
        const exists = await checkTableExists(table);
        if (exists) {
            console.log(`⚠️  FOUND: ${table} (potential duplicate)`);
            foundDuplicates = true;
        }
    }

    if (!foundDuplicates) {
        console.log('✅ No duplicate tables found');
    }
    console.log();

    console.log('='.repeat(80));
    console.log('PHASE D COMPLETE');
    console.log('='.repeat(80));
}

checkDuplicates();
