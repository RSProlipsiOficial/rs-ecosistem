
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vmyguklvtscavdbtmowm.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZteWd1a2x2dHNjYXZkYnXRtb3dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4NTYyMDYsImV4cCI6MjAyNTQzMjIwNn0.7-9e-1q_2_2_2_2_2_2_2_2_2_2_2_2_2_2_2_2_2_2_2';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectProfiles() {
    console.log("Fetching profiles...");
    const { data, error } = await supabase
        .from('minisite_profiles')
        .select('*')
        .limit(5);

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log("Profiles found:", data.length);
    data.forEach(p => {
        console.log("--- Profile ---");
        console.log("ID (user_id):", p.user_id);
        console.log("Consultant ID (slug?):", p.consultant_id);
        console.log("Slug:", p.slug);
        console.log("Username:", p.username);
        console.log("Email:", p.email);
        console.log("Name:", p.name);
        console.log("CPF:", p.cpf);
        console.log("Address:", p.address_street, p.address_number, p.address_zip);
    });
}

inspectProfiles();
