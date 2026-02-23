const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVans() {
    try {
        const { data, error } = await supabase
            .from('vans')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        console.log('--- TABELA VANS ---');
        console.log(data);

        if (data.length > 0) {
            const owners = data.map(v => v.user_id).filter(id => id);
            const { data: profs } = await supabase
                .from('user_profiles')
                .select('user_id, nome_completo')
                .in('user_id', owners);
            console.log('\nNomes dos Donos:', profs);
        }
        console.log('-------------------');

    } catch (error) {
        console.error('Erro Fatal:', error);
    }
}

checkVans();
