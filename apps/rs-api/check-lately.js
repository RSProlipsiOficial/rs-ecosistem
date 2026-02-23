const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLately() {
    try {
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
        console.log('--- BUSCANDO PERFIS (ÚLTIMOS 3 DIAS) ---');
        console.log('Desde:', threeDaysAgo);

        const { data, error } = await supabase
            .from('user_profiles')
            .select('user_id, nome_completo, created_at')
            .gte('created_at', threeDaysAgo);

        if (error) throw error;
        console.log('Encontrados:', data);

        // Também conferir na tabela usuarios se tem alguém NOVO (id maior?) 
        // Como é UUID, não dá. Mas podemos pegar os últimos 20 por ID se for serial, 
        // mas são UUID.

        // Vamos ver se existe alguma conta com o nome "Matheus" que NÃO é consultor
        const { data: mRota } = await supabase.from('user_profiles').select('*').ilike('nome_completo', '%Matheus%');
        console.log('\nMatheus na Rota:', mRota);

    } catch (error) {
        console.error('Erro:', error);
    }
}

checkLately();
