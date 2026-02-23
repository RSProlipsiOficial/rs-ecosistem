import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || 'https://rptkhrboejbwexseikuo.supabase.co';
// Using Service Role Key from rs-api .env
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(url, key, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function main() {
    console.log('Searching users matching "Prólipsi"...');

    // 1. Check existing minisite_profiles
    const { data: profiles, error } = await supabase
        .from('minisite_profiles')
        .select('id, name, type, email')
        .ilike('name', '%Prólipsi%');

    if (error) {
        console.error('Error fetching minisite_profiles:', error);
    } else if (profiles && profiles.length > 0) {
        console.log('Found in minisite_profiles:', profiles);
        const user = profiles[0];
        if (user.type !== 'cd') {
            console.log(`Promoting ${user.name} to CD...`);
            const { error: updateError } = await supabase
                .from('minisite_profiles')
                .update({ type: 'cd' })
                .eq('id', user.id);
            console.log('Update result:', updateError || 'Success');
        } else {
            console.log(`${user.name} is already a CD.`);
        }
        return;
    }

    // 2. Check Auth Users (Service Role Required)
    console.log('Searching in Auth Users...');
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error('Error listing auth users:', authError);
        return;
    }

    // Find by email or metadata
    const prolipsiUser = users.find(u =>
        (u.email && u.email.toLowerCase().includes('prolipsi')) ||
        (u.user_metadata && u.user_metadata.full_name && u.user_metadata.full_name.includes('Prólipsi'))
    );

    if (prolipsiUser) {
        console.log('Found Auth User:', prolipsiUser.email, prolipsiUser.id);
        // Upsert minisite profile
        const { error: insertError } = await supabase
            .from('minisite_profiles')
            .upsert({
                id: prolipsiUser.id,
                consultant_id: prolipsiUser.id,
                name: prolipsiUser.user_metadata.full_name || 'RS Prólipsi',
                email: prolipsiUser.email,
                type: 'cd',
                address_city: 'Curitiba',
                address_state: 'PR'
            });
        console.log('Upsert result:', insertError || 'Success');
    } else {
        console.log('No user found. Creating new auth user: admin@rsprolipsi.com.br');
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: 'admin@rsprolipsi.com.br',
            password: 'ChangeMe123!',
            email_confirm: true,
            user_metadata: { full_name: 'RS Prólipsi Oficial' }
        });

        if (createError) {
            console.error('Error creating user:', createError);
        } else {
            console.log('Created user:', newUser.user.id);
            const { error: insertError } = await supabase
                .from('minisite_profiles')
                .insert({
                    id: newUser.user.id,
                    consultant_id: newUser.user.id,
                    name: 'RS Prólipsi Oficial',
                    email: 'admin@rsprolipsi.com.br',
                    type: 'cd',
                    address_city: 'Curitiba',
                    address_state: 'PR'
                });
            console.log('Profile creation result:', insertError || 'Success');
        }
    }
}

main();
