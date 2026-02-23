
const { Client } = require('pg');

// Connection string recuperada das credenciais
// postgresql://postgres:[YOUR_PASSWORD]@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres
// Senha: Yannis784512@
const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log('✅ Conectado ao banco de dados com sucesso!');

        // 1. Criar RPC execute_sql para uso futuro (facilita diagnósticos via API)
        console.log('🛠️ Criando função execute_sql...');
        await client.query(`
      CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
      RETURNS json
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
          result json;
      BEGIN
          EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || sql_query || ') t' INTO result;
          RETURN result;
      END;
      $$;
      GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO service_role;
    `);
        console.log('✅ Função execute_sql criada/atualizada.');

        // 2. Diagnosticar Triggers em Orders
        console.log('🔍 Buscando triggers problemáticos na tabela orders...');
        const res = await client.query(`
      SELECT tgname, prosrc 
      FROM pg_trigger t
      JOIN pg_proc p ON t.tgfoid = p.oid
      WHERE t.tgrelid = 'public.orders'::regclass;
    `);

        const triggers = res.rows;
        const problemTriggers = triggers.filter(t => t.prosrc.includes('customer_id'));

        if (problemTriggers.length > 0) {
            console.log(`🚨 Encontrados ${problemTriggers.length} triggers problemáticos.`);
            for (const t of problemTriggers) {
                console.log(`🔥 Removendo trigger: ${t.tgname}`);
                await client.query(`DROP TRIGGER IF EXISTS "${t.tgname}" ON public.orders;`);
                // Opcional: Dropar a função também se for exclusiva
            }
            console.log('✅ Limpeza concluída.');
        } else {
            console.log('✅ Nenhum trigger com referência a "customer_id" encontrado.');
            // Listar todos para conferência
            console.table(triggers.map(t => ({ name: t.tgname })));
        }

    } catch (err) {
        console.error('❌ Erro:', err.message);
    } finally {
        await client.end();
    }
}

run();
