
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser(targetEmail) {
    console.log(`Checking user: ${targetEmail}`);

    // 1. List Users with higher limit
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (authError) {
        console.error('Auth Error:', authError.message);
        return;
    }

    console.log(`Total Auth Users Found: ${users.length}`);
    if (users.length > 0) {
        console.log(`Example User: ${users[0].email}`);
    }

    const user = users.find(u => u.email === targetEmail);

    if (!user) {
        console.log('❌ User NOT FOUND in Auth (checked 1000 records).');

        // Check if any similar email exists
        const similar = users.find(u => u.email && u.email.includes('rsprolipsi'));
        if (similar) {
            console.log(`Did you mean: ${similar.email}?`);
        }
        return;
    }

    console.log(`✅ User Found in Auth! ID: ${user.id}`);

    // 2. Check user_profiles
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

    if (profileError) {
        console.log('❌ Error fetching user_profiles:', profileError.message);
    } else if (!profile) {
        console.log('❌ Profile NOT FOUND in user_profiles for this ID.');
    } else {
        console.log('✅ Profile Found in user_profiles:', profile);
    }

    // 3. Check consultores (Legacy)
    const { data: consultor, error: consultorError } = await supabase
        .from('consultores')
        .select('*')
        .eq('email', targetEmail)
        .maybeSingle();

    if (consultorError) {
        console.log('❌ Error fetching consultores:', consultorError.message);
    } else if (!consultor) {
        console.log('❌ Consultant NOT FOUND in consultores table.');
    } else {
        console.log('✅ Data Found in consultores table:', consultor);
    }
}

checkUser('rsprolipsioficial@gmail.com');
