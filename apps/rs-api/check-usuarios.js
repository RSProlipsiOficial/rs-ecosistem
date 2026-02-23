const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCounts() {
    try {
        // 1. Consultores RS Prólipsi
        const { count: consultoresCount } = await supabase
            .from('consultores')
            .select('*', { count: 'exact', head: true });

        // 2. Usuarios Rota Fácil (Donos/Admins)
        // No Rota Fácil, a tabela usuarios parece ser a principal para quem gerencia o app
        const { count: usuariosCount, error } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true });

        if (error) console.error('Erro Usuarios Rota:', error);

        console.log('--- CONTAGENS ---');
        console.log('Consultores RS Prólipsi:', consultoresCount);
        console.log('Donos Rota Fácil (tabela usuarios):', usuariosCount);
        console.log('------------------');

    } catch (error) {
        console.error('Erro Fatal:', error);
    }
}

checkCounts();
