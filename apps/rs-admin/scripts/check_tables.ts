
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rptkhrboejbwexseikuo.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkTables() {
    const commonNames = ['consultants', 'consultant', 'profiles', 'users', 'members', 'partners', 'rede', 'network'];

    for (const name of commonNames) {
        const { data, error } = await supabase.from(name).select('count', { count: 'exact', head: true });
        if (error) {
            // console.log(`❌ ${name}: ${error.message}`);
            if (error.message.includes('relation "public.' + name + '" does not exist')) {
                console.log(`❌ ${name}: Does not exist`);
            } else {
                console.log(`❌ ${name}: Error - ${error.message}`);
            }
        } else {
            console.log(`✅ ${name}: Exists!`);
        }
    }
}

checkTables();
