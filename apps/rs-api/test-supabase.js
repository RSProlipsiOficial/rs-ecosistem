const { supabase } = require('./src/lib/supabaseClient');

async function testSupabaseConnection() {
  console.log('🔍 Testando conexão com Supabase...');
  
  try {
    // Testar conexão simples
    const { data, error } = await supabase.from('unified_users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      return false;
    }
    
    console.log('✅ Conexão com Supabase bem-sucedida!');
    console.log(`📊 Total de usuários: ${data.length > 0 ? 'Tabela acessível' : 'Tabela vazia ou não encontrada'}`);
    return true;
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    return false;
  }
}

// Executar teste
testSupabaseConnection().then(success => {
  process.exit(success ? 0 : 1);
});