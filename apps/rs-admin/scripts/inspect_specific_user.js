
import { createClient } from '@supabase/supabase-js';

// URL found in rs-consultor/.env
const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
// Key found in rs-api/.env (Service Role)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log("Inspecting profile for emclaro@hotmail.com...");
    const { data, error } = await supabase
        .from('minisite_profiles')
        .select('*')
        .eq('email', 'emclaro@hotmail.com');

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Data:", JSON.stringify(data, null, 2));
    }
}

inspect();
