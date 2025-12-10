import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rptkhrboejbwexseikuo.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y'; // From rs-consultor .env

if (!SERVICE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);
const anonClient = createClient(SUPABASE_URL, ANON_KEY);

async function verifyRLS() {
    console.log('🔒 Verifying RLS on career_levels...');

    // 1. Admin Read (Service Role)
    const { data: adminData, error: adminError } = await adminClient.from('career_levels').select('*').limit(1);
    if (adminError) {
        console.error('❌ Admin Read Failed:', adminError.message);
    } else {
        console.log('✅ Admin Read Success:', adminData?.length || 0, 'records');
    }

    // 2. Anon Read (Should Succeed)
    const { data: anonData, error: anonError } = await anonClient.from('career_levels').select('*').limit(1);
    if (anonError) {
        console.error('❌ Anon Read Failed (Should be allowed):', anonError.message);
    } else {
        console.log('✅ Anon Read Success:', anonData?.length || 0, 'records');
    }

    // 3. Anon Update (Should Fail)
    if (anonData && anonData.length > 0) {
        const idToUpdate = anonData[0].id;
        const { error: updateError } = await anonClient
            .from('career_levels')
            .update({ name: 'HACKED' })
            .eq('id', idToUpdate);
        
        if (updateError) {
            console.log('✅ Anon Update Blocked (RLS Working):', updateError.message);
        } else {
            console.error('❌ Anon Update Succeeded (RLS MISSING OR WEAK)!');
            // Revert
            await adminClient.from('career_levels').update({ name: anonData[0].name }).eq('id', idToUpdate);
        }
    } else {
        console.log('⚠️ Could not test Anon Update because no data found.');
    }
}

verifyRLS();
