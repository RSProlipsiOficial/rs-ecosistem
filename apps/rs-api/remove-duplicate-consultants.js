const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeDuplicates() {
    console.log('🔍 Fetching all consultants...');

    // Fetch all consultants with all columns to inspect schema
    const { data: consultants, error } = await supabase
        .from('consultores')
        .select('*')
        .order('created_at', { ascending: false }); // Newest first

    if (error) {
        console.error('❌ Error fetching consultants:', error);
        return;
    }

    if (!consultants || consultants.length === 0) {
        console.log('⚠️  No consultants found in the database.');
        return;
    }

    console.log(`📊 Total consultants found: ${consultants.length}`);

    // Inspect first record to determine available columns
    const sampleRecord = consultants[0];
    console.log('\n📋 Available columns:', Object.keys(sampleRecord).join(', '));

    // Determine the best column to identify duplicates
    // Priority: codigo_consultor > cpf > email > username
    let duplicateKey = null;
    const potentialKeys = ['codigo_consultor', 'cpf', 'email', 'username'];
    for (const key of potentialKeys) {
        if (sampleRecord.hasOwnProperty(key)) {
            duplicateKey = key;
            console.log(`\n✅ Using '${duplicateKey}' to identify duplicates`);
            break;
        }
    }

    if (!duplicateKey) {
        console.error('❌ Could not find a suitable column for duplicate detection.');
        console.log('   Sample record:', JSON.stringify(sampleRecord, null, 2));
        return;
    }

    // Group by the chosen key
    const grouped = {};
    consultants.forEach(c => {
        const keyValue = c[duplicateKey];
        if (!keyValue) return; // Skip if key value is null/undefined
        if (!grouped[keyValue]) {
            grouped[keyValue] = [];
        }
        grouped[keyValue].push(c);
    });

    const duplicatesToRemove = [];
    let duplicateGroupCount = 0;

    // Identify duplicates (keep first = most recent since we ordered by created_at DESC)
    console.log('\n🔍 Analyzing for duplicates...');
    for (const keyValue in grouped) {
        const group = grouped[keyValue];
        if (group.length > 1) {
            duplicateGroupCount++;
            console.log(`⚠️  Duplicate '${duplicateKey}' = ${keyValue} (${group.length} records):`);
            // Keep index 0 (newest), remove others
            for (let i = 1; i < group.length; i++) {
                const dup = group[i];
                console.log(`   - Delete: ID ${dup.id} (Nome: ${dup.nome || 'N/A'}, Created: ${dup.created_at})`);
                duplicatesToRemove.push(dup.id);
            }
            console.log(`   - Keep: ID ${group[0].id} (Nome: ${group[0].nome || 'N/A'}, Created: ${group[0].created_at})`);
        }
    }

    if (duplicatesToRemove.length === 0) {
        console.log('\n✅ No duplicates found! Database is clean.');
        return;
    }

    console.log(`\n📊 Found ${duplicateGroupCount} duplicate groups.`);
    console.log(`📊 Total records to delete: ${duplicatesToRemove.length}`);

    // Delete duplicates
    console.log('\n🚀 Deleting duplicates...');

    const { error: deleteError, count } = await supabase
        .from('consultores')
        .delete()
        .in('id', duplicatesToRemove);

    if (deleteError) {
        console.error('❌ Error deleting duplicates:', deleteError);
    } else {
        console.log(`✅ Successfully deleted ${duplicatesToRemove.length} duplicate records.`);
    }

    // Verify
    console.log('\n🔍 Verifying...');
    const { data: remaining } = await supabase
        .from('consultores')
        .select('id')
        .order('created_at', { ascending: false });
    console.log(`📊 Remaining consultants: ${remaining?.length || 0}`);
}

removeDuplicates().catch(err => {
    console.error('Unexpected error:', err);
});
