const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
    const { data, error } = await supabase.from('minisite_profiles').select('*').limit(1);
    if (data && data.length > 0) {
        console.log(Object.keys(data[0]));
    } else {
        console.log("No data or error", error);
    }
}
check();
