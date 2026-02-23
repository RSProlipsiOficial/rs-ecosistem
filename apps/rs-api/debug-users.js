const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUsers() {
    try {
        console.log('--- DEBUG USUARIOS ---');
        const { data: users, error: errU } = await supabase
            .from('usuarios')
            .select('*')
            .limit(10);

        if (errU) console.error('Erro Usuarios:', errU);
        console.log('Amostra Usuarios:', users);

        if (users && users.length > 0) {
            const ids = users.map(u => u.id);
            const { data: profs, error: errP } = await supabase
                .from('user_profiles')
                .select('*')
                .in('id', ids); // Tentar ID primeiro

            console.log('\nBusca em user_profiles por id:', profs);

            const { data: profs2, error: errP2 } = await supabase
                .from('user_profiles')
                .select('*')
                .in('user_id', ids); // Tentar user_id depois

            console.log('\nBusca em user_profiles por user_id:', profs2);
        }
    } catch (error) {
        console.error('Fatal:', error);
    }
}

debugUsers();
