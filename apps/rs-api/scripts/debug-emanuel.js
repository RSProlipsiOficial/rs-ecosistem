require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debug() {
    const email = 'emclaro@hotmail.com';
    console.log(`Analyzing: ${email}`);

    // 1. Authenticated User
    const { data: { users } } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const authUser = users.find(u => u.email === email);
    console.log('Auth User:', authUser ? { id: authUser.id, email: authUser.email } : 'NOT FOUND');

    if (!authUser) return;

    // 2. Consultant Profile
    const { data: consultant, error } = await supabase
        .from('consultores')
        .select('*')
        .or(`email.eq.${email},user_id.eq.${authUser.id}`)
        .maybeSingle();

    if (error) console.error('DB Error:', error);

    console.log('\nConsultant Record:', consultant);

    if (consultant) {
        // 3. Check Downlines (Directs)
        // Search by Sponsor ID (UUID)
        const { data: directsByUUID, count: countUUID } = await supabase
            .from('consultores')
            .select('id, nome, email', { count: 'exact' })
            .eq('patrocinador_id', consultant.id);

        console.log(`\nDirects (by ID ${consultant.id}): ${countUUID}`);
        if (countUUID > 0) console.table(directsByUUID);

        // Search by Username (if exists)
        if (consultant.username) {
            const { data: directsByUsername, count: countUser } = await supabase
                .from('consultores')
                .select('id, nome, email', { count: 'exact' })
                .eq('patrocinador_id', consultant.username);

            console.log(`\nDirects (by Username ${consultant.username}): ${countUser}`);
            if (countUser > 0) console.table(directsByUsername);
        }
    }
}

debug();
