const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .limit(1);

        if (error) throw error;
        console.log('--- SCHEMA USUARIOS (ROTA FÁCIL) ---');
        if (data && data.length > 0) {
            console.log('Colunas:', Object.keys(data[0]));
            console.log('Exemplo:', data[0]);
        } else {
            console.log('Tabela vazia');
        }
        console.log('------------------------------------');

    } catch (error) {
        console.error('Erro Fatal:', error);
    }
}

checkSchema();
