const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findSpecifics() {
    try {
        console.log('--- BUSCA ESPECÍFICA ---');

        // Buscar no Rota Fácil (perfis)
        const { data: pMatheus, error: err1 } = await supabase
            .from('user_profiles')
            .select('user_id, nome_completo, email')
            .ilike('nome_completo', '%Matheus%');

        console.log('Perfis Matheus (Rota):', pMatheus);

        // Buscar no RS Prólipsi (consultores)
        const { data: cMatheus, error: err2 } = await supabase
            .from('consultores')
            .select('id, nome, email')
            .ilike('nome', '%Matheus%');

        console.log('Consultores Matheus (RS):', cMatheus);

        // Contagem de usuarios que NÃO são motoristas/monitoras se houver esse campo
        // Como tipo_usuario não existe na tabela user_profiles (vimos antes), vamos verusuarios
        const { data: users, error: err3 } = await supabase
            .from('usuarios')
            .select('nome, email')
            .limit(10);

        console.log('Exemplos usuarios Rota:', users);

        console.log('-------------------------');

    } catch (error) {
        console.error('Erro Fatal:', error);
    }
}

findSpecifics();
