
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function reset() {
    const email = 'rsprolipsioficial@gmail.com';
    const newPass = 'Yannis784512@';

    console.log(`Resetting password for ${email} to ${newPass}...`);

    const { data: { users } } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const user = users.find(u => u.email === email);

    if (user) {
        const { error } = await supabase.auth.admin.updateUserById(user.id, { password: newPass });
        if (error) console.error('Error:', error);
        else console.log('✅ Password updated successfully!');
    } else {
        console.log('❌ User not found to reset.');
    }
}

reset();
