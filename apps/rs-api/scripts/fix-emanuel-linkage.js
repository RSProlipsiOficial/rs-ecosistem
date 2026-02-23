const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function checkEmanuelLinkage() {
    console.log('\n🔍 VERIFICANDO LINKAGE DO EMANUEL\n');
    console.log('='.repeat(60));

    const targetEmail = 'emclaro@hotmail.com';

    // 1. Buscar usuário no Auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000
    });

    if (authError) {
        console.error('❌ Erro ao buscar usuários Auth:', authError);
        return;
    }

    const authUser = users.find(u => u.email?.toLowerCase() === targetEmail);

    if (!authUser) {
        console.log('❌ Usuário Auth NÃO ENCONTRADO para:', targetEmail);
        return;
    }

    console.log('\n✅ AUTH USER ENCONTRADO:');
    console.log('  UUID:', authUser.id);
    console.log('  Email:', authUser.email);
    console.log('  Created:', authUser.created_at);

    // 2. Buscar no consultores por email
    const { data: consultor, error: consultorErr } = await supabase
        .from('consultores')
        .select('*')
        .eq('email', targetEmail)
        .maybeSingle();

    if (consultorErr) {
        console.error('\n❌ Erro ao buscar consultor:', consultorErr);
        return;
    }

    if (!consultor) {
        console.log('\n❌ CONSULTOR NÃO ENCONTRADO na tabela consultores');
        return;
    }

    console.log('\n✅ CONSULTOR ENCONTRADO:');
    console.log('  ID (consultores):', consultor.id);
    console.log('  User ID:', consultor.user_id);
    console.log('  Nome:', consultor.nome);
    console.log('  Username:', consultor.username);
    console.log('  Email:', consultor.email);
    console.log('  Patrocinador ID:', consultor.patrocinador_id);

    // 3. Verificar linkage
    console.log('\n📋 ANÁLISE DE LINKAGE:');

    const idMatch = consultor.id === authUser.id;
    const userIdMatch = consultor.user_id === authUser.id;

    console.log('  consultor.id === auth.id:', idMatch ? '✅ SIM' : '❌ NÃO');
    console.log('  consultor.user_id === auth.id:', userIdMatch ? '✅ SIM' : '❌ NÃO');

    if (!idMatch && !userIdMatch) {
        console.log('\n⚠️  PROBLEMA IDENTIFICADO:');
        console.log('  O registro do consultor NÃO está linkado ao Auth UUID!');
        console.log('\n💡 SOLUÇÃO:');
        console.log(`  Precisamos atualizar consultores.user_id para: ${authUser.id}`);

        // 4. Propor correção
        console.log('\n🔧 Aplicando correção...');

        const { error: updateErr } = await supabase
            .from('consultores')
            .update({ user_id: authUser.id })
            .eq('email', targetEmail);

        if (updateErr) {
            console.error('❌ Erro ao atualizar:', updateErr);
        } else {
            console.log('✅ LINKAGE CORRIGIDO COM SUCESSO!');
            console.log(`   consultores.user_id agora aponta para: ${authUser.id}`);
        }
    } else {
        console.log('\n✅ Linkage está CORRETO! O problema está em outro lugar.');
    }

    // 5. Buscar diretos (para confirmar estrutura da rede)
    const { data: diretos } = await supabase
        .from('consultores')
        .select('id, nome, email, username')
        .eq('patrocinador_id', consultor.username || consultor.id)
        .limit(5);

    console.log('\n📊 PRIMEIROS 5 DIRETOS (sample):');
    if (diretos && diretos.length > 0) {
        diretos.forEach((d, i) => {
            console.log(`  ${i + 1}. ${d.nome} (${d.email})`);
        });
        console.log(`\n  Total: ${diretos.length} (mostrando apenas 5)`);
    } else {
        console.log('  ⚠️  Nenhum direto encontrado!');
    }

    console.log('\n' + '='.repeat(60));
}

checkEmanuelLinkage()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Erro fatal:', err);
        process.exit(1);
    });
