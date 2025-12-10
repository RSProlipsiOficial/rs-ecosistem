/**
 * Script para executar SQL direto no Supabase PostgreSQL
 * Adiciona as colunas faltantes
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function executarCorrecao() {
    console.log('🔧 Conectando ao Supabase...');
    
    try {
        // 1. Adicionar coluna created_by
        console.log('\n📝 Adicionando coluna created_by...');
        const { error: error1 } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE announcements ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);'
        });
        
        if (error1) {
            console.log('⚠️ Nota:', error1.message);
        } else {
            console.log('✅ Coluna created_by adicionada!');
        }
        
        // 2. Testar insert
        console.log('\n🧪 Testando INSERT...');
        const { data, error: error2 } = await supabase
            .from('announcements')
            .insert({
                type: 'info',
                title: 'Teste Direto JS',
                content: 'Teste de inserção via Node.js',
                is_new: true,
                is_published: true,
                created_by: 'admin'
            })
            .select();
        
        if (error2) {
            console.log('❌ Erro ao inserir:', error2.message);
        } else {
            console.log('✅ Comunicado inserido com sucesso!');
            console.log('📊 Dados:', data);
        }
        
        // 3. Verificar registros
        console.log('\n📊 Verificando registros...');
        const { data: registros, error: error3 } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);
        
        if (error3) {
            console.log('❌ Erro:', error3.message);
        } else {
            console.log(`✅ Total de comunicados: ${registros.length}`);
            registros.forEach((r, i) => {
                console.log(`${i + 1}. ${r.title} (${r.is_published ? 'Publicado' : 'Não publicado'})`);
            });
        }
        
    } catch (err) {
        console.error('❌ Erro geral:', err.message);
    }
}

executarCorrecao();
