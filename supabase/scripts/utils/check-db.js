const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  try {
    console.log('🔍 Verificando banco de dados...\n');
    
    // Tentar consultar tabelas principais
    const tables = ['consultores', 'wallets', 'orders', 'matriz_cycles', 'product_catalog'];
    let existingTables = 0;
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          console.log(`✅ ${table}: ${count || 0} registros`);
          existingTables++;
        } else {
          console.log(`❌ ${table}: não existe`);
        }
      } catch (e) {
        console.log(`❌ ${table}: não existe`);
      }
    }
    
    console.log(`\n📊 Resultado: ${existingTables}/${tables.length} tabelas encontradas\n`);
    
    if (existingTables === 0) {
      console.log('⚠️  BANCO NÃO CONFIGURADO!');
      console.log('\n📍 EXECUTE MANUALMENTE:');
      console.log('   1. Acesse: https://rptkhrboejbwexseikuo.supabase.co/project/rptkhrboejbwexseikuo/sql/new');
      console.log('   2. Copie o conteúdo de: DEPLOY-SQL-UNICO.sql');
      console.log('   3. Cole no SQL Editor');
      console.log('   4. Clique em RUN');
      console.log('   5. Aguarde ~15 segundos');
      console.log('\n📍 DEPOIS:');
      console.log('   1. Database → Replication');
      console.log('   2. Procure: cycle_events');
      console.log('   3. Ative: ON');
      console.log('   4. Save');
    } else if (existingTables === tables.length) {
      console.log('🎉 BANCO JÁ CONFIGURADO!');
      console.log('\n✅ Próximo passo: Configurar Webhook Mercado Pago');
      console.log('📍 https://www.mercadopago.com.br/developers/panel/webhooks');
      console.log('   URL: https://api.rsprolipsi.com.br/api/webhook/mercadopago');
      console.log('   Eventos: payment');
    } else {
      console.log('⚠️  BANCO PARCIALMENTE CONFIGURADO!');
      console.log('   Execute o SQL completo novamente.');
    }
    
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  }
}

checkDatabase();
