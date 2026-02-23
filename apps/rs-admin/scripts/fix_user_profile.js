
import { createClient } from '@supabase/supabase-js';

// URL found in rs-consultor/.env
const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
// Key found in rs-api/.env (Service Role)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixProfile() {
    console.log("Searching user UUID...");

    // 1. Get User ID from Auth (with pagination)
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers({ perPage: 1000 });

    if (userError) {
        console.error("Error listing users:", userError);
        return;
    }

    const user = users.find(u => u.email === 'emclaro@hotmail.com');

    if (!user) {
        console.error("User emclaro@hotmail.com not found in Auth!");
        return;
    }

    console.log("User Found:", user.id);

    // 2. Insert Profile (Schema: user_id, email, name, username, cpf, phone)
    // Assuming 'slug' column doesn't exist, using 'username'
    console.log("Creating minisite_profile...");
    const { error: insertError } = await supabase
        .from('minisite_profiles')
        .insert([{
            user_id: user.id,
            email: 'emclaro@hotmail.com',
            name: 'Emanuel Mendes Claro',
            username: 'emclaro', // Using username as slug substitute
            cpf: '23.430.313/0001-85',
            phone: '(41) 99286-3922'
            // Removed role, whatsapp, consultant_id, slug based on errors/guesses
        }]);

    if (insertError) {
        console.error("Error creating profile:", insertError);
        if (insertError.message.includes('column')) {
            console.log("Schema mismatch. Trying without 'username'...");
            // Fallback attempt? No, let's see error first.
        }
    } else {
        console.log("Profile created successfully linked to UUID:", user.id);
    }
}

fixProfile();
