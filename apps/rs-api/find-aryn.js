const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findAryn() {
    try {
        console.log('--- BUSCANDO PERFIL DE ARYN RODRIGUES ---');
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .ilike('nome_completo', '%Aryn%');

        if (error) throw error;
        console.log('Perfil Encontrado:', JSON.stringify(data, null, 2));

        // Também buscar "Beto chamado por Jesus"
        const { data: beto } = await supabase
            .from('user_profiles')
            .select('*')
            .ilike('nome_completo', '%Beto%');
        console.log('\nPerfil Beto:', JSON.stringify(beto, null, 2));

    } catch (error) {
        console.error('Erro Fatal:', error);
    }
}

findAryn();
