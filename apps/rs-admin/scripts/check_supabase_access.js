
import { createClient } from '@supabase/supabase-js';

// URL found in rs-consultor/.env
const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
// Key found in rs-consultor/.env
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectProfile() {
    console.log("Checking minisite_profiles for emclaro@hotmail.com...");
    const { data, error } = await supabase
        .from('minisite_profiles')
        .select('*')
        .eq('email', 'emclaro@hotmail.com');

    if (error) {
        console.log("Error:", error.message);
    } else {
        console.log("Profile Data:", data);
        if (data && data.length > 0) {
            data.forEach(p => {
                console.log("---");
                console.log("User ID:", p.user_id);
                console.log("Slug:", p.slug);
                console.log("Consultant ID:", p.consultant_id);
                console.log("Username:", p.username); // Some tables use username
                console.log("Referral Link:", p.referral_link);
            });
        } else {
            console.log("No profile found.");
        }
    }
}

inspectProfile();
