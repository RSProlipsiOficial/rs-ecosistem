require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function reset() {
    const email = 'emclaro@hotmail.com';
    const newPass = '123456';

    console.log(`Resetting password for ${email} to ${newPass}...`);

    const { data: { users }, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    const user = users.find(u => u.email === email);

    if (user) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { password: newPass });
        if (updateError) {
            console.error('Error updating password:', updateError);
        } else {
            console.log('✅ Password updated successfully!');
        }
    } else {
        console.log(`❌ User ${email} not found.`);
        // List all users to see if it exists with different case
        console.log('Available users:', users.map(u => u.email));
    }
}

reset();
