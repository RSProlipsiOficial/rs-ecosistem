
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/rs-api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function run() {
    console.log('--- DIAGNÓSTICO SUPABASE ---');
    console.log('URL:', supabaseUrl);

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Erro: SUPABASE_URL ou KEY não encontradas no .env');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Testar conexão básica
    const { data: dbTime, error: timeErr } = await supabase.rpc('get_current_time');
    if (timeErr) {
        console.log('⚠️ RPC get_current_time não disponível (esperado).');
    }

    // 2. Verificar consultores
    console.log('🔍 Buscando na tabela "consultores"...');
    const { count, error: consultError } = await supabase
        .from('consultores')
        .select('*', { count: 'exact', head: true });

    if (consultError) {
        console.error('❌ Erro ao acessar "consultores":', consultError.message);
    } else {
        console.log('✅ Tabela "consultores" encontrada. Total de registros:', count);
    }

    // 3. Verificar user_profiles (outra possível tabela)
    console.log('🔍 Buscando na tabela "user_profiles"...');
    const { count: countProfiles, error: profError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

    if (profError) {
        console.log('ℹ️ Tabela "user_profiles" erro/não encontrada:', profError.message);
    } else {
        console.log('✅ Tabela "user_profiles" encontrada. Total:', countProfiles);
    }

    // 4. Verificar se existe algum consultor com id consultor
    const { data: sample } = await supabase.from('consultores').select('*').limit(1);
    if (sample && sample.length > 0) {
        console.log('📝 Exemplo de consultor:', sample[0].nome, 'Status:', sample[0].status);
    }
}

run();
