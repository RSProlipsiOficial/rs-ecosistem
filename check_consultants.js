import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function check() {
    console.log('Checking consultants table...');
    const { count, error } = await supabase.from('consultants').select('*', { count: 'exact', head: true });

    if (error) {
        console.log('Error accessing consultants:', error.message);
        // Try 'consultores' just in case
        console.log('Checking consultores table...');
        const { count: count2, error: error2 } = await supabase.from('consultores').select('*', { count: 'exact', head: true });
        if (error2) {
            console.log('Error accessing consultores:', error2.message);
        } else {
            console.log('consultores table exists. Count:', count2);
        }
    } else {
        console.log('consultants table exists. Count:', count);
    }
}

check();
