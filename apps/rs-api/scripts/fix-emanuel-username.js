const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixEmanuelUsername() {
    console.log('\n🔧 CORRIGINDO USERNAME DO EMANUEL\n');

    const emanuelId = '179d44cd-3351-4cdb-ad1e-78ac274108c2';
    const newUsername = 'enclaro';

    // 1. Verificar estado atual
    const { data: current } = await supabase
        .from('consultores')
        .select('id, nome, username')
        .eq('id', emanuelId)
        .single();

    console.log('📊 Estado Atual:');
    console.log('  Nome:', current?.nome);
    console.log('  Username:', current?.username);
    console.log('');

    // 2. Atualizar
    const { data: updated, error } = await supabase
        .from('consultores')
        .update({ username: newUsername })
        .eq('id', emanuelId)
        .select();

    if (error) {
        console.error('❌ Erro ao atualizar:', error.message);
    } else {
        console.log('✅ Sucesso! Username atualizado.');
        console.log('  Novo Username:', updated[0].username);
    }

    // 3. Verificar impacto na busca de filhos (simulação rápida)
    // O username é usado como chave de busca para filhos?
    // O sistema busca por id OR username.
    console.log('\n🔍 Verificando impacto na estrutura:');
    console.log('  Agora o sistema poderá encontrar filhos que tenham patrocinador_id = "enclaro"');
}

fixEmanuelUsername()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Erro:', err);
        process.exit(1);
    });
