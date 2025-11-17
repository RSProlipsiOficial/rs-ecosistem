const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSql() {
  try {
    // Verificar tabelas existentes
    console.log('🔍 Verificando tabelas existentes...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['consultores', 'wallets', 'orders', 'matriz_cycles', 'cycle_events']);
    
    if (tablesError) {
      console.log('⚠️ Erro ao verificar tabelas (normal se não existem):', tablesError.message);
    } else if (tables && tables.length > 0) {
      console.log(`✅ ${tables.length} tabelas já existem:`, tables.map(t => t.table_name).join(', '));
      console.log('✅ Banco já configurado!');
      return;
    }
    
    console.log('📝 Tabelas não encontradas. Execute manualmente o SQL no Supabase Dashboard.');
    console.log('📍 URL: https://rptkhrboejbwexseikuo.supabase.co/project/rptkhrboejbwexseikuo/sql/new');
    console.log('📄 Arquivo: DEPLOY-SQL-UNICO.sql');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('\n📍 Execute manualmente:');
    console.log('   1. Acesse: https://rptkhrboejbwexseikuo.supabase.co');
    console.log('   2. SQL Editor → New Query');
    console.log('   3. Cole o conteúdo de DEPLOY-SQL-UNICO.sql');
    console.log('   4. Clique em RUN');
  }
}

executeSql();
