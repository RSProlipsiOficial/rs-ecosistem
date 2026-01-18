
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAdmin() {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error(error);
        return;
    }

    console.log('Auth Users:');
    users.forEach(u => console.log(`- ${u.email} (${u.id})`));

    // Also check Root consultant
    const { data: root } = await supabase
        .from('consultores')
        .select('*')
        .eq('id', 'ab3c3567-69f4-4af8-9261-6d452d7a96dc')
        .single();

    console.log('Root Consultant:', root ? `${root.nome} (${root.email})` : 'Not found');
}

checkAdmin();
