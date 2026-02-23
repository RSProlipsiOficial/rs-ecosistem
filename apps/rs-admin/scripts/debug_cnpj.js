
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not found in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectCNPJ() {
    const cnpj = '23430313000185';
    console.log(`Searching for CNPJ: ${cnpj}`);

    // Check user_profiles
    console.log('\n--- Checking user_profiles ---');
    const { data: users, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .or(`document.eq.${cnpj},cpf.eq.${cnpj},document.eq.23.430.313/0001-85`); // Try formatted too just in case

    if (userError) console.error('Error querying user_profiles:', userError.message);
    else {
        console.log(`Found ${users.length} users in user_profiles:`);
        users.forEach(u => console.log(`- ID: ${u.user_id}, Name: ${u.full_name}, Doc: ${u.document}, CPF: ${u.cpf}`));
    }

    // Check minisite_profiles
    console.log('\n--- Checking minisite_profiles ---');
    const { data: profiles, error: profileError } = await supabase
        .from('minisite_profiles')
        .select('*')
        //.eq('document', cnpj); // Try generically
        .or(`document.eq.${cnpj},document.eq.23.430.313/0001-85`);

    if (profileError) console.error('Error querying minisite_profiles:', profileError.message);
    else {
        console.log(`Found ${profiles.length} profiles in minisite_profiles:`);
        profiles.forEach(p => console.log(`- ID: ${p.id}, Name: ${p.name}, Doc: ${p.document}`));
    }
}

inspectCNPJ();
