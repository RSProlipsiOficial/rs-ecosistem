const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function describeProfiles() {
    try {
        const { data, error } = await supabase.from('user_profiles').select('*').limit(1);
        if (error) {
            console.error('Erro:', error.message);
            return;
        }
        if (data && data.length > 0) {
            console.log('Colunas de user_profiles:', Object.keys(data[0]));
        } else {
            console.log('Tabela user_profiles vazia.');
        }
    } catch (e) {
        console.error(e);
    }
}

describeProfiles();
