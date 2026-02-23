require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkRoles() {
    const email = 'rsprolipsioficial@gmail.com';
    console.log(`Checking roles for ${email}...`);

    // Get user from auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        console.log('User not found in Auth');
        return;
    }

    console.log(`User ID: ${user.id}`);

    // Get user roles
    const { data: roles, error: roleError } = await supabase.from('user_roles').select('*').eq('user_id', user.id);

    if (roleError) {
        console.error('Role Error:', roleError);
    } else {
        console.log('Roles found:', roles);
    }
}

checkRoles();
