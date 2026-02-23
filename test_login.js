const { createClient } = require('@supabase/supabase-js');

const URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo'; // Service Role

const supabase = createClient(URL, KEY);

async function checkAuth() {
    const email = 'rsprolipsioficial@gmail.com';
    const password = 'Yannis784512@';

    console.log(`Testing login for ${email}...`);

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.log('LOGIN FAILED:', error.message);

        // If login fails, let's check if user exists in auth.users (admin only)
        const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
        if (userError) {
            console.log('Error listing users:', userError.message);
        } else {
            const userBound = userData.users.find(u => u.email === email);
            if (userBound) {
                console.log('User EXISTS in Auth table. ID:', userBound.id);
                console.log('Metadata:', userBound.user_metadata);
            } else {
                console.log('User DOES NOT EXIST in Auth table.');
            }
        }
    } else {
        console.log('LOGIN SUCCESSFUL!');
        console.log('User ID:', data.user.id);
        console.log('Access Token:', data.session.access_token ? 'Present' : 'Missing');
    }
}

checkAuth();
