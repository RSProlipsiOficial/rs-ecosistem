const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function describeDownlines() {
    const { data, error } = await supabase.from('downlines').select('*').limit(1);
    if (error) {
        console.error('Erro:', error);
    } else if (data && data.length > 0) {
        console.log('Colunas de downlines:', Object.keys(data[0]));
        console.log('Exemplo de registro:', data[0]);
    } else {
        console.log('Tabela downlines vazia ou não encontrada.');
    }
}

describeDownlines();
