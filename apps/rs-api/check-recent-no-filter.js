const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecent() {
    try {
        console.log('--- 10 PERFIS MAIS RECENTES (user_profiles) ---');
        const { data, error } = await supabase
            .from('user_profiles')
            .select('user_id, nome_completo, created_at')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        data.forEach(p => {
            console.log(`[${p.created_at}] ${p.nome_completo} ID: ${p.user_id}`);
        });

        if (data.length > 0) {
            const ids = data.map(p => p.user_id);
            const { data: users } = await supabase
                .from('usuarios')
                .select('id, patrocinador_id')
                .in('id', ids);

            console.log('\nPatrocinadores desses perfis:');
            console.log(users);
        }

    } catch (error) {
        console.error('Erro:', error);
    }
}

checkRecent();
