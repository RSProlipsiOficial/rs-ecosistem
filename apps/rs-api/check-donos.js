const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCounts() {
    try {
        // 1. Consultores RS Prólipsi
        const { count: consultoresCount, error: err1 } = await supabase
            .from('consultores')
            .select('*', { count: 'exact', head: true });

        if (err1) console.error('Erro Consultores:', err1);

        // 2. Donos Rota Fácil
        const { count: donosCount, error: err2 } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('tipo_usuario', 'usuario');

        if (err2) console.error('Erro Donos:', err2);

        console.log('--- CONTAGENS ---');
        console.log('Consultores RS Prólipsi:', consultoresCount);
        console.log('Donos Rota Fácil:', donosCount);
        console.log('------------------');

        // Listar tabelas se possível ou tentar outra tabela comum
        const { data: users, error: err3 } = await supabase
            .from('user_profiles')
            .select('id, tipo_usuario')
            .limit(1);

        if (err3) console.error('Erro User Profiles detail:', err3);
        else console.log('Exemplo User Profile:', users);

    } catch (error) {
        console.error('Erro Fatal:', error);
    }
}

checkCounts();
