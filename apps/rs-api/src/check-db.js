
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log('🔍 Verificando estrutura do banco...\n');

    // Check total count
    const { count, error: countError } = await supabase
        .from('consultores')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('❌ Erro ao contar:', countError.message);
        return;
    }
    console.log(`📊 Total de consultores no banco: ${count}\n`);

    // Get samples with better error handling
    const { data: samples, error: sampleError } = await supabase
        .from('consultores')
        .select('id, nome, login, patrocinador_id, created_at')
        .order('created_at', { ascending: true })
        .limit(5);

    if (sampleError) {
        console.error('❌ Erro ao buscar amostras:', sampleError.message);
    } else {
        console.log('📝 Primeiros 5 consultores cadastrados:');
        samples?.forEach((c, i) => {
            console.log(`  ${i + 1}. ${c.nome || c.login} (${c.login}) - Patroc: ${c.patrocinador_id || 'null'}`);
        });
    }

    console.log('\n');

    // Search for root user(s)
    const { data: possibleRoots, error: rootError } = await supabase
        .from('consultores')
        .select('id, nome, login, patrocinador_id')
        .is('patrocinador_id', null)
        .limit(5);

    if (rootError) {
        console.error('❌ Erro ao buscar raiz:', rootError.message);
    } else {
        console.log('👑 Possíveis usuários raiz (sem patrocinador):');
        possibleRoots?.forEach((c, i) => {
            console.log(`  ${i + 1}. ${c.nome || c.login} (${c.login})`);
        });
    }
}

check();
