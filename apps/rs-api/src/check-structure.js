
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkStructure() {
    console.log('🔍 Descobrindo estrutura da tabela consultores...\n');

    // Get one record to see columns
    const { data, error } = await supabase
        .from('consultores')
        .select('*')
        .limit(1);

    if (error) {
        console.error('❌ Erro:', error.message);
        return;
    }

    if (data && data.length > 0) {
        console.log('📊 Colunas disponíveis:', Object.keys(data[0]));
        console.log('\n📝 Amostra de registro:');
        console.log(JSON.stringify(data[0], null, 2));
    } else {
        console.log('⚠️ Tabela vazia');
    }
}

checkStructure();
