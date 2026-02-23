const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erro: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontrados no .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTable() {
    console.log('🚀 Tentando criar tabela cycle_closings...');

    // Como o cliente JS não tem create table direto, usamos RPC ou SQL (se habilitado)
    // Mas para segurança em ambiente dev, vamos apenas tentar um insert de teste
    // Se falhar com 42P01 (undefined_table), avisaremos ao usuário.

    const { error } = await supabase
        .from('cycle_closings')
        .select('id')
        .limit(1);

    if (error && error.code === '42P01') {
        console.log('⚠️ Tabela cycle_closings não existe. Por favor, execute o SQL abaixo no dashboard do Supabase:');
        console.log(`
      CREATE TABLE IF NOT EXISTS public.cycle_closings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          type TEXT NOT NULL, -- 'MENSAL' | 'TRIMESTRAL'
          period TEXT NOT NULL,
          total_volume NUMERIC DEFAULT 0,
          bonus_distributed NUMERIC DEFAULT 0,
          status TEXT DEFAULT 'COMPLETADO',
          executed_at TIMESTAMPTZ DEFAULT now()
      );
      
      ALTER TABLE public.cycle_closings ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Permitir leitura para admins" ON public.cycle_closings FOR SELECT USING (true);
    `);
    } else if (error) {
        console.error('❌ Erro inesperado:', error.message);
    } else {
        console.log('✅ Tabela cycle_closings já existe e está acessível.');
    }
}

createTable();
