
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateUserFields() {
    const userId = '2ffcf3ae-fc73-4f22-8201-f5a2d43c0a6c';
    console.log("Updating CPF/Phone for emclaro...");

    const { error } = await supabase
        .from('user_profiles')
        .update({
            cpf: '23.430.313/0001-85',
            telefone: '(41) 99286-3922'
        })
        .eq('user_id', userId);

    if (error) console.error("Error:", error);
    else console.log("CPF and Phone updated successfully!");
}

updateUserFields();
