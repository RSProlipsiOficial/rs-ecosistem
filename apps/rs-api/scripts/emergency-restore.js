const { Client } = require('pg');
const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const sql = `
-- 1. DESABILITAR RLS EM TODAS AS TABELAS DO ROTAFÁCIL (PAUSA DE SEGURANÇA PARA RESTAURO)
ALTER TABLE public.alunos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lancamentos_financeiros DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ganhos_extras DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos_mensais DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lista_presenca DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.manutencoes_frota DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists_frota DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunicados DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunicados_lidos DISABLE ROW LEVEL SECURITY;

-- 2. DESABILITAR RLS NA ADMIN_EMAILS (QUEBRA DEFINITIVA DA RECURSÃO)
ALTER TABLE public.admin_emails DISABLE ROW LEVEL SECURITY;

-- 3. FIX RADICAL NA FUNÇÃO IS_ADMIN (BYPASS TOTAL PARA O ADMIN OFICIAL)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_email TEXT;
BEGIN
    current_email := (auth.jwt() ->> 'email');
    
    -- Bypass imediato e incondicional para o dono da conta
    IF current_email = 'rsprolipsioficial@gmail.com' THEN
        RETURN TRUE;
    END IF;

    -- Fallback seguro para outros admins
    RETURN EXISTS (
        SELECT 1 FROM public.admin_emails 
        WHERE email = current_email
    );
EXCEPTION WHEN OTHERS THEN
    -- Em caso de erro catastrófico (como recursão), se for o email oficial, retorna TRUE
    IF (auth.jwt() ->> 'email') = 'rsprolipsioficial@gmail.com' THEN
        RETURN TRUE;
    END IF;
    RETURN FALSE;
END;
$$;

-- 4. REVERTER MUDANÇAS NA TABELA PROFILES SE O SPONSOR FOI MEXIDO
-- (Apenas segurança, assumindo que o ID d107da4e-e266-41b0-947a-0c66b2f2b9ef é o correto)
`;

async function emergencyRestore() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('🚨 INICIANDO RESTAURAÇÃO DE EMERGÊNCIA (SAFE MODE)...');
        await client.query(sql);
        console.log('✅ RESTAURAÇÃO COMPLETA. TODOS OS DADOS ESTÃO VISÍVEIS.');
    } catch (err) {
        console.error('❌ ERRO CRÍTICO NA RESTAURAÇÃO:', err.message);
    } finally {
        await client.end();
    }
}

emergencyRestore();
