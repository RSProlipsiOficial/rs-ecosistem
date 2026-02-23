const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function describeMatrixCycles() {
    try {
        const { data, error } = await supabase.from('matriz_cycles').select('*').limit(1);
        if (error) {
            console.error('Erro:', error.message);
            // Tentar outra tabela comum
            const { data: q2 } = await supabase.from('sigma_matrix').select('*').limit(1);
            if (q2 && q2.length > 0) console.log('Colunas de sigma_matrix:', Object.keys(q2[0]));
            return;
        }
        if (data && data.length > 0) {
            console.log('Colunas de matriz_cycles:', Object.keys(data[0]));
        } else {
            console.log('Tabela matriz_cycles vazia.');
        }
    } catch (e) {
        console.error(e);
    }
}

describeMatrixCycles();
