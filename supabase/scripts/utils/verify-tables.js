const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTables() {
  console.log('🔍 Verificando tabelas criadas...\n');
  
  // Tentar query SQL direto
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `
  });
  
  if (error) {
    console.log('⚠️ Método exec_sql não disponível');
    console.log('Testando acesso às tabelas...\n');
    
    const tables = [
      'consultores', 
      'wallets', 
      'product_catalog', 
      'matriz_cycles', 
      'orders',
      'order_items',
      'cycle_events',
      'bonuses',
      'sales',
      'downlines',
      'matrix_accumulator'
    ];
    
    let found = [];
    
    for (const table of tables) {
      try {
        const { error: testError } = await supabase.from(table).select('id').limit(1);
        if (!testError || testError.message.includes('must have at least')) {
          found.push(table);
          console.log(`✅ ${table}`);
        }
      } catch (e) {
        // Tabela não existe
      }
    }
    
    console.log(`\n📊 Total: ${found.length}/${tables.length} tabelas encontradas`);
    
    if (found.length > 0) {
      console.log('\n🎉 BANCO CONFIGURADO COM SUCESSO!');
      console.log('\n✅ Próximo passo:');
      console.log('   1. Database → Replication → cycle_events → ON');
      console.log('   2. Configurar Webhook MP:');
      console.log('      https://www.mercadopago.com.br/developers/panel/webhooks');
      console.log('      URL: https://api.rsprolipsi.com.br/api/webhook/mercadopago');
    } else {
      console.log('\n❌ Nenhuma tabela encontrada!');
      console.log('   O SQL pode ter falhado silenciosamente.');
      console.log('   Verifique no Supabase Dashboard se apareceu erro.');
    }
  } else {
    console.log('📊 Tabelas:', data);
  }
}

verifyTables().catch(console.error);
