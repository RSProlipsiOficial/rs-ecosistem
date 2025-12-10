const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração direta do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('🔍 Testando conexão com Supabase...');
console.log('URL:', supabaseUrl);
console.log('Chave presente:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Testar conexão com uma consulta simples
    const { data, error } = await supabase.from('unified_users').select('id').limit(1);
    
    if (error) {
      console.error('❌ Erro na consulta:', error.message);
      return false;
    }
    
    console.log('✅ Conexão com Supabase bem-sucedida!');
    console.log(`📊 Resultado: ${data.length} usuário(s) encontrado(s)`);
    return true;
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    return false;
  }
}

// Executar teste
testConnection().then(success => {
  process.exit(success ? 0 : 1);
});