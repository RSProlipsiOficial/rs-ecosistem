
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugCNPJ() {
    const rawCNPJ = '23430313000185';
    const formattedCNPJ = '23.430.313/0001-85';

    console.log(`\n--- SEARCHING FOR: ${rawCNPJ} OR ${formattedCNPJ} ---`);

    // 1. Check user_profiles
    console.log('\n[1] Checking user_profiles...');
    const { data: users, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .or(`document.eq.${rawCNPJ},document.eq.${formattedCNPJ},cpf.eq.${rawCNPJ},cpf.eq.${formattedCNPJ}`);

    if (userError) {
        console.error('Error user_profiles:', userError.message);
    } else {
        console.log(`Found ${users.length} in user_profiles.`);
        users.forEach(u => console.log('   >>> FOUND USER:', u.email, u.document, u.cpf));
    }

    // 2. Check minisite_profiles
    console.log('\n[2] Checking minisite_profiles...');
    const { data: minis, error: miniError } = await supabase
        .from('minisite_profiles')
        .select('*')
        .or(`document.eq.${rawCNPJ},document.eq.${formattedCNPJ}`);

    if (miniError) {
        console.error('Error minisite_profiles:', miniError.message);
    } else {
        console.log(`Found ${minis.length} in minisite_profiles.`);
        minis.forEach(m => console.log('   >>> FOUND PROFILE:', m.email, m.document));
    }

    // 3. Broad Search (Partial Match)
    console.log('\n[3] Trying BROAD search (ilike)...');
    const { data: broadUsers, error: broadError } = await supabase
        .from('user_profiles')
        .select('email, document, cpf')
        .or(`document.ilike.%${rawCNPJ}%,cpf.ilike.%${rawCNPJ}%`)
        .limit(5);

    if (broadError) console.error(broadError.message);
    else {
        console.log(`Found ${broadUsers.length} partial matches in USER_PROFILES.`);
        broadUsers.forEach(u => console.log('   >>> PARTIAL USER:', u));
    }

    const { data: broadMinis, error: broadMiniError } = await supabase
        .from('minisite_profiles')
        .select('email, document')
        .ilike('document', `%${rawCNPJ}%`)
        .limit(5);

    if (broadMiniError) console.error(broadMiniError.message);
    else {
        console.log(`Found ${broadMinis.length} partial matches in MINISITE_PROFILES.`);
        broadMinis.forEach(m => console.log('   >>> PARTIAL MINI:', m));
    }
}

debugCNPJ();
