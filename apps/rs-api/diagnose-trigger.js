
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Credenciais ausentes no .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log('🔍 Diagnosticando triggers na tabela "orders"...');

    // Tentar via RPC "execute_sql" (Padrão RS)
    const { data, error } = await supabase.rpc('execute_sql', {
        sql_query: `
      SELECT 
          tgname as trigger_name,
          proname as function_name,
          prosrc as function_source
      FROM pg_trigger t
      JOIN pg_proc p ON t.tgfoid = p.oid
      WHERE t.tgrelid = 'public.orders'::regclass;
    `
    });

    if (error) {
        console.error('❌ Falha ao executar SQL via RPC:', error.message);
        console.log('⚠️ Tentando listar via tabela information_schema (se acessível)...');

        // Fallback: Tentar select direto (geralmente bloqueado, mas vale a pena tentar com service role)
        /* 
           Nota: Service Role ignora RLS, mas triggers são metadados de sistema. 
           Geralmente pg_catalog não é acessível via API REST.
        */
    } else {
        console.log('✅ Triggers encontrados:');
        console.table(data);

        // Check for "customer_id" in source
        const problemTriggers = data.filter(r => r.function_source.includes('customer_id'));
        if (problemTriggers.length > 0) {
            console.log('\n🚨 GATILHOS PROBLEMÁTICOS ENCONTRADOS (Ref "customer_id"):');
            problemTriggers.forEach(t => {
                console.log(`- Trigger: ${t.trigger_name}`);
                console.log(`- Função: ${t.function_name}`);
                console.log(`- Código:\n${t.function_source}\n`);
            });
        } else {
            console.log('✅ Nenhum trigger com referência explícita a "customer_id" encontrado no código fonte exposto.');
        }
    }
}

diagnose();
