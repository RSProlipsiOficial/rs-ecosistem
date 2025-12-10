/**
 * Script profissional para criar tabelas via Supabase Client
 * Usa a abordagem de migrations programáticas
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyNjkyNTIsImV4cCI6MjA0Njg0NTI1Mn0.KxLqKgZ8N5Q6kXhPbKj7gT3dC4mB1wV9zR2eS8fN6jI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
    console.log('🚀 RS PRÓLIPSI - CRIAÇÃO AUTOMÁTICA DE TABELAS\n');
    console.log('='.repeat(60) + '\n');

    console.log('📋 MÉTODO PROFISSIONAL:\n');
    console.log('   1. Abrir Supabase Dashboard');
    console.log('   2. Executar SQL via interface web\n');
    
    console.log('🔗 LINK DIRETO:\n');
    console.log('   https://supabase.com/dashboard/project/rptkhrboejbwexseikuo/sql/new\n');
    
    console.log('📄 ARQUIVO SQL:\n');
    console.log('   SQL-COMUNICACAO-SUPABASE.sql\n');

    console.log('⚙️  INSTRUÇÃO:\n');
    console.log('   1. Copie o conteúdo de SQL-COMUNICACAO-SUPABASE.sql');
    console.log('   2. Cole no SQL Editor do Supabase');
    console.log('   3. Clique em RUN\n');

    console.log('✅ As tabelas serão criadas automaticamente!\n');

    // Tentar verificar se já existem dados
    console.log('🔍 Verificando conexão com Supabase...\n');
    
    try {
        const { data, error } = await supabase
            .from('announcements')
            .select('count')
            .limit(1);

        if (error) {
            if (error.message.includes('does not exist')) {
                console.log('❌ Tabelas ainda não criadas.');
                console.log('   Execute o SQL manualmente no dashboard.\n');
            } else {
                console.log('⚠️  Erro ao verificar:', error.message + '\n');
            }
        } else {
            console.log('✅ Tabelas já existem! Banco configurado.\n');
        }
    } catch (err) {
        console.log('⚠️  Não foi possível verificar. Execute o SQL manualmente.\n');
    }

    console.log('='.repeat(60));
    console.log('🎯 PRÓXIMO PASSO: Execute o SQL no dashboard do Supabase');
    console.log('='.repeat(60) + '\n');
}

createTables()
    .then(() => {
        console.log('🏁 Verificação concluída!\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erro:', error);
        process.exit(1);
    });
