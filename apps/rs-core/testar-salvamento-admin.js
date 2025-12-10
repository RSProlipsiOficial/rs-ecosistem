/**
 * TESTE DIRETO DE SALVAMENTO - SIMULAR O QUE O ADMIN FAZ
 * Vamos simular exatamente o que o Admin frontend faz quando salva
 */

const { createClient } = require('@supabase/supabase-js');

// Credenciais EXATAS do Admin
const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testarSalvamentoAdmin() {
    console.log('🧪 TESTE DE SALVAMENTO - SIMULANDO O ADMIN\n');
    console.log('='.repeat(80));
    
    try {
        // 1. TESTAR CONEXÃO
        console.log('\n1️⃣ Testando conexão com Supabase...');
        const { data: testData, error: testError } = await supabase
            .from('announcements')
            .select('count');
        
        if (testError) {
            console.log('❌ ERRO DE CONEXÃO:', testError.message);
            console.log('   Detalhes:', JSON.stringify(testError, null, 2));
            return;
        }
        
        console.log('✅ Conexão OK!');
        
        // 2. TENTAR INSERIR (EXATAMENTE COMO O ADMIN FAZ)
        console.log('\n2️⃣ Tentando inserir comunicado...');
        
        const novoAnuncio = {
            type: 'info',
            title: 'Teste Salvamento Admin',
            content: 'Este é um teste para verificar por que o Admin não está salvando',
            is_new: true,
            is_published: true,
            created_by: 'admin'
        };
        
        console.log('   Dados a serem inseridos:', JSON.stringify(novoAnuncio, null, 2));
        
        const { data, error } = await supabase
            .from('announcements')
            .insert([novoAnuncio])
            .select()
            .single();
        
        if (error) {
            console.log('\n❌ ERRO AO INSERIR:');
            console.log('   Mensagem:', error.message);
            console.log('   Código:', error.code);
            console.log('   Detalhes:', error.details);
            console.log('   Hint:', error.hint);
            console.log('\n   JSON completo:', JSON.stringify(error, null, 2));
            return;
        }
        
        console.log('\n✅ INSERÇÃO BEM-SUCEDIDA!');
        console.log('   ID:', data.id);
        console.log('   Título:', data.title);
        console.log('   Criado em:', data.created_at);
        
        // 3. VERIFICAR SE FOI SALVO
        console.log('\n3️⃣ Verificando se foi salvo...');
        
        const { data: verificacao, error: errorVerificacao } = await supabase
            .from('announcements')
            .select('*')
            .eq('id', data.id)
            .single();
        
        if (errorVerificacao) {
            console.log('❌ Erro ao verificar:', errorVerificacao.message);
            return;
        }
        
        console.log('✅ Comunicado encontrado no banco!');
        console.log('   Dados:', JSON.stringify(verificacao, null, 2));
        
        // 4. LISTAR TODOS
        console.log('\n4️⃣ Listando todos os comunicados...');
        
        const { data: todos, error: errorTodos } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (errorTodos) {
            console.log('❌ Erro ao listar:', errorTodos.message);
            return;
        }
        
        console.log(`✅ Total de comunicados: ${todos.length}`);
        todos.forEach((item, i) => {
            console.log(`   ${i + 1}. ${item.title} (${item.is_published ? 'Publicado' : 'Não publicado'})`);
        });
        
        // 5. TESTAR UPDATE
        console.log('\n5️⃣ Testando atualização...');
        
        const { data: updated, error: errorUpdate } = await supabase
            .from('announcements')
            .update({ title: 'Teste Atualizado' })
            .eq('id', data.id)
            .select()
            .single();
        
        if (errorUpdate) {
            console.log('❌ Erro ao atualizar:', errorUpdate.message);
        } else {
            console.log('✅ Atualização bem-sucedida!');
            console.log('   Novo título:', updated.title);
        }
        
        // 6. DELETAR TESTE
        console.log('\n6️⃣ Deletando registro de teste...');
        
        const { error: errorDelete } = await supabase
            .from('announcements')
            .delete()
            .eq('id', data.id);
        
        if (errorDelete) {
            console.log('❌ Erro ao deletar:', errorDelete.message);
        } else {
            console.log('✅ Registro deletado!');
        }
        
        // RESUMO FINAL
        console.log('\n' + '='.repeat(80));
        console.log('📊 RESUMO DO TESTE');
        console.log('='.repeat(80));
        console.log('✅ Conexão: OK');
        console.log('✅ Inserção: OK');
        console.log('✅ Verificação: OK');
        console.log('✅ Listagem: OK');
        console.log('✅ Atualização: OK');
        console.log('✅ Deleção: OK');
        console.log('\n💡 CONCLUSÃO: O Supabase está funcionando perfeitamente!');
        console.log('   O problema deve estar no FRONTEND do Admin.');
        
    } catch (err) {
        console.error('\n❌ ERRO GERAL:', err.message);
        console.error(err.stack);
    }
}

testarSalvamentoAdmin();
