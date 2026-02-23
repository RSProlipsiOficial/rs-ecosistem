require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('--- Config ---');
console.log('URL:', supabaseUrl);
console.log('Key Present:', !!supabaseKey);
console.log('Key Type:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : (process.env.SUPABASE_SERVICE_KEY ? 'SERVICE_KEY' : 'ANON_KEY'));

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStats() {
    console.log('\n--- Checking Consultants ---');
    const { count, error } = await supabase
        .from('consultores')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error counting consultants:', error);
    } else {
        console.log('Total Consultants (Count):', count);
    }

    const { data: rsData, error: rsError } = await supabase.from('consultores').select('nome, email, status').limit(5);
    if (!rsError) console.log('Consultants Sample:', rsData?.length);

    console.log('\n--- Checking User Profiles (Rota) ---');
    const { data: profiles, error: profileError } = await supabase.from('user_profiles').select('id, nome_completo').limit(5);
    if (profileError) {
        console.error('Error fetching user_profiles:', profileError);
    } else {
        console.log('First 5 Profiles:', profiles);
    }

    console.log('\n--- Checking Cycle Events ---');
    const { count: cycles, error: cycleError } = await supabase.from('cycle_events').select('*', { count: 'exact', head: true });
    if (cycleError) {
        console.error('Error counting cycles:', cycleError);
    } else {
        console.log('Total Cycles:', cycles);
    }

    console.log('\n--- Checking Cycle Events (Filtered 1st Day Month) ---');
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    console.log('Filter Date:', firstDayOfMonth);
    const { count: cyclesFiltered, error: cycleFilterError } = await supabase.from('cycle_events').select('*', { count: 'exact', head: true }).gte('created_at', firstDayOfMonth);
    if (cycleFilterError) {
        console.error('Error counting filtered filtered cycles:', cycleFilterError);
    } else {
        console.log('Cycles this month:', cyclesFiltered);
    }
}

checkStats();
