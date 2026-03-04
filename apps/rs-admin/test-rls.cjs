require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

// from rs-admin/.env
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// hardcoded for a quick test (from rs-api)
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo";

const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
    console.log("--- ANON KEY ---");
    const resAnon = await anonClient.from('cd_orders').select('*').limit(5);
    console.log("Error:", resAnon.error?.message || "None");
    console.log("Data count:", resAnon.data?.length);

    console.log("\n--- SERVICE ROLE KEY ---");
    const resAdmin = await adminClient.from('cd_orders').select('*').limit(5);
    console.log("Error:", resAdmin.error?.message || "None");
    console.log("Data count:", resAdmin.data?.length);

    if (resAdmin.data?.length > 0) {
        console.log("First Order ID:", resAdmin.data[0].id);
        console.log("First Order Status:", resAdmin.data[0].status);
    }
}
test();
