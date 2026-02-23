const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rptkhrboejbwexseikuo.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// PRECISAMOS DA SERVICE ROLE KEY PARA ALTERAR TABELAS
// Vou tentar usar SQL via RPC se existir, ou apenas logar que precisa ser feito manualmente no painel
// Como não tenho a service role aqui fácil (está no .env do servidor, mas vou tentar ler do arquivo .env se estiver lá)

const fs = require('fs');
const path = require('path');
const envPath = path.resolve(__dirname, '.env');
const envConfig = require('dotenv').parse(fs.readFileSync(envPath));

const serviceRoleKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
    console.error('❌ ERRO: SUPABASE_SERVICE_ROLE_KEY não encontrada no .env. Não consigo rodar migração de schema.');
    console.log('⚠️  Por favor, adicione "is_admin" (boolean, default false) na tabela "consultores" manualmente via Painel Supabase.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runMigration() {
    console.log('🚀 Iniciando migração: Add is_admin to consultores...');

    // Tentar adicionar via SQL raw se possível, ou via RPC 'execute_sql' que criamos antes
    const { data, error } = await supabase.rpc('execute_sql', {
        sql_query: "ALTER TABLE consultores ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;"
    });

    if (error) {
        console.error('❌ Erro RPC:', error);
        // Fallback: Tentar via pg direto se tivesse, mas não temos.
    } else {
        console.log('✅ Migração Sucesso (ou coluna já existia).');
    }
}

runMigration();
