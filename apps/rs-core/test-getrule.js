require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('='.repeat(80));
console.log('DYNAMIC CONFIG VALIDATION - PHASE B');
console.log('Testing Supabase -> rs-core (getRule) flow');
console.log('='.repeat(80));
console.log();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGetRule() {
    try {
        // Step 1: Read directly from Supabase
        console.log('📖 Step 1: Reading directly from sigma_settings table');
        console.log('-'.repeat(80));
        
        const { data, error } = await supabase
            .from('sigma_settings')
            .select('cycle_value, updated_at')
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error('❌ Error reading from Supabase:', error);
            console.log();
            console.log('⚠️  This likely means the sigma_settings table does not exist yet.');
            console.log('   Please run the migration: supabase/migrations/rs-backend-sync-001.sql');
            console.log();
            return;
        }

        if (!data) {
            console.log('⚠️  No data found in sigma_settings table');
            console.log('   This is expected if the table exists but is empty.');
            console.log('   Default values will be used.');
            console.log();
        } else {
            console.log('✅ Data from Supabase:');
            console.log(`   cycle_value: ${data.cycle_value}`);
            console.log(`   updated_at: ${data.updated_at}`);
            console.log();
        }

        // Step 2: Simulate getRule logic
        console.log('🔧 Step 2: Simulating getRule logic');
        console.log('-'.repeat(80));
        
        const DEFAULT_CYCLE_VALUE = 360;
        const cycleValueFromDB = data?.cycle_value ? Number(data.cycle_value) : null;
        const finalValue = cycleValueFromDB || DEFAULT_CYCLE_VALUE;
        const usedFallback = cycleValueFromDB === null;

        console.log(`   Value from DB: ${cycleValueFromDB}`);
        console.log(`   Default value: ${DEFAULT_CYCLE_VALUE}`);
        console.log(`   Final value:   ${finalValue}`);
        console.log(`   Used fallback: ${usedFallback ? 'YES' : 'NO'}`);
        console.log();

        // Step 3: Summary
        console.log('📊 SUMMARY:');
        console.log('-'.repeat(80));
        if (usedFallback) {
            console.log('⚠️  getRule would use FALLBACK (hardcoded RULES)');
            console.log('   Reason: No data in sigma_settings OR table does not exist');
        } else {
            console.log('✅ getRule would use DYNAMIC CONFIG from Supabase');
            console.log(`   Value: ${finalValue}`);
        }
        console.log();

    } catch (error) {
        console.error('❌ Test failed with error:');
        console.error(error);
    }

    console.log('='.repeat(80));
    console.log('PHASE B COMPLETE');
    console.log('='.repeat(80));
}

testGetRule();
