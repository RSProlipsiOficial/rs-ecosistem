
import { createClient } from '@supabase/supabase-js';

// URL found in rs-consultor/.env
const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
// Key found in rs-api/.env (Service Role)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUserProfile() {
    const userId = '2ffcf3ae-fc73-4f22-8201-f5a2d43c0a6c'; // Discovered in previous step
    console.log("Checking user_profiles for UUID:", userId);

    const { data: existing, error: checkError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId);

    if (checkError) {
        console.error("Error checking profile:", checkError);
        return;
    }

    if (existing && existing.length > 0) {
        console.log("Profile Found:", existing[0]);
        // Update slug if needed
        if (existing[0].slug !== 'emclaro') {
            console.log("Updating slug to 'emclaro'...");
            const { error: updateError } = await supabase
                .from('user_profiles')
                .update({ slug: 'emclaro' })
                .eq('id', existing[0].id);

            if (updateError) console.error("Update failed:", updateError);
            else console.log("Slug updated successfully!");
        } else {
            console.log("Slug is already correct.");
        }
    } else {
        console.log("Profile missing. Creating...");
        const { error: insertError } = await supabase
            .from('user_profiles')
            .insert([{
                user_id: userId,
                nome_completo: 'Emanuel Mendes Claro',
                slug: 'emclaro',
                cpf: '23.430.313/0001-85',
                telefone: '(41) 99286-3922'
                // Add other fields if necessary
            }]);

        if (insertError) console.error("Insert failed:", insertError);
        else console.log("Profile inserted successfully!");
    }
}

fixUserProfile();
