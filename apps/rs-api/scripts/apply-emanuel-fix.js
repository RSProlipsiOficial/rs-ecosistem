const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function fixEmanuelLinkage() {
    const targetEmail = 'emclaro@hotmail.com';
    const authUUID = '2ffcf3ae-fc73-4f22-8201-f5a2d43c0a6c';
    const consultorId = '179d44cd-3351-4cdb-ad1e-78ac274108c2';

    console.log('\n🔧 CORRIGINDO LINKAGE DO EMANUEL\n');
    console.log('='.repeat(60));
    console.log('Email:', targetEmail);
    console.log('Auth UUID:', authUUID);
    console.log('Consultor ID:', consultorId);
    console.log('');

    // Atualizar user_id
    const { error } = await supabase
        .from('consultores')
        .update({ user_id: authUUID })
        .eq('id', consultorId);

    if (error) {
        console.error('❌ ERRO ao atualizar:', error);
        return;
    }

    console.log('✅ LINKAGE CORRIGIDO COM SUCESSO!');
    console.log('');

    // Verificar
    const { data: verificacao } = await supabase
        .from('consultores')
        .select('id, user_id, nome, email')
        .eq('id', consultorId)
        .single();

    console.log('📋 VERIFICAÇÃO:');
    console.log('  ID:', verificacao.id);
    console.log('  User ID:', verificacao.user_id);
    console.log('  Nome:', verificacao.nome);
    console.log('  Email:', verificacao.email);
    console.log('');

    if (verificacao.user_id === authUUID) {
        console.log('✅ Linkage confirmado! Emanuel agora pode ver sua rede.');
    } else {
        console.log('❌ Algo deu errado na verificação.');
    }

    console.log('='.repeat(60));
}

fixEmanuelLinkage()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Erro:', err);
        process.exit(1);
    });
