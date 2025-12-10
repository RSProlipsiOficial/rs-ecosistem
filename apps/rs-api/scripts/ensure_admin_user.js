
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'g:\\Rs  Ecosystem\\rs-ecosystem\\apps\\rs-api\\.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
    const email = 'rsprolipsioficial@gmail.com';
    console.log(`Checking user ${email}...`);

    // List users (requires service role)
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    const user = users.find(u => u.email === email);
    
    if (user) {
        console.log('User found:', user.id);
        // Check if password works? We can't check password directly.
        // But we can update it to be sure.
        console.log('Updating password to ensure it matches hardcoded one...');
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            user.id,
            { password: 'Yannis784512@', user_metadata: { role: 'admin' } }
        );
        if (updateError) console.error('Error updating password:', updateError);
        else console.log('Password updated.');
    } else {
        console.log('User not found. Creating...');
        const { data, error: createError } = await supabase.auth.admin.createUser({
            email: email,
            password: 'Yannis784512@',
            email_confirm: true,
            user_metadata: { role: 'admin' }
        });
        
        if (createError) console.error('Error creating user:', createError);
        else console.log('User created:', data.user.id);
    }
}

checkUser();
