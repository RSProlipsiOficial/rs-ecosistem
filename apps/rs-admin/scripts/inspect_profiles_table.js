
import { createClient } from '@supabase/supabase-js';

// URL found in rs-consultor/.env
const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
// Key found in rs-api/.env (Service Role)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectProfiles() {
    console.log("Inspecting 'profiles' table...");

    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error accessing profiles:", error);
    } else {
        console.log("Profiles Data Sample:", data);
        if (data.length > 0) {
            console.log("Columns:", Object.keys(data[0]));
        }
    }
}

inspectProfiles();
