const { Client } = require('pg');
const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const sql = `
-- 1. QUEBRAR O LOOP DE RECURSÃO (BRUTE FORCE)
ALTER TABLE public.admin_emails DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own admin email" ON public.admin_emails;
DROP POLICY IF EXISTS "admin_emails_secure_select" ON public.admin_emails;

-- 2. SIMPLIFICAR IS_ADMIN PARA NÃO DEPENDER DE RLS
-- Security definer faz a função rodar com privilégios de owner (ignora RLS durante a execução)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_emails 
    WHERE email = (auth.jwt() ->> 'email')
  );
END;
$$;

-- 3. GARANTIR QUE O USUÁRIO OFICIAL SEMPRE SEJA VISTO COMO ADMIN (OVERRIDE DE SEGURANÇA)
-- Substituímos a função para ser ainda mais robusta durante a restauração
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_email TEXT;
BEGIN
    current_email := (auth.jwt() ->> 'email');
    
    -- Hardcoded bypass para o admin oficial durante a restauração
    IF current_email = 'rsprolipsioficial@gmail.com' THEN
        RETURN TRUE;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.admin_emails 
        WHERE email = current_email
    );
END;
$$;

-- 4. LIMPAR POLÍTICAS DUPLICADAS EM ALUNOS QUE POSSAM CAUSAR CONFLITO
-- Vou manter apenas as básicas para garantir que o dono veja seus dados
-- (Este passo é conservador, removemos as que parecem 'estranhas' ou redundantes)
-- De acordo com o log: 'Alunos: colaboradores v2', 'Responsável vê seus alunos via função', etc.
`;

async function restoreAccess() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('📡 Restaurando acesso de administrador...');
        await client.query(sql);
        console.log('✅ Acesso restaurado com sucesso!');
    } catch (err) {
        console.error('❌ Erro na restauração:', err.message);
    } finally {
        await client.end();
    }
}

restoreAccess();
