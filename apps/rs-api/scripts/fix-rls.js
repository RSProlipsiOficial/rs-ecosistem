const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres';

const sql = `
-- 1. Desabilitar RLS temporariamente para limpar o loop
ALTER TABLE public.admin_emails DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas recursivas da admin_emails
DROP POLICY IF EXISTS "Users can view own admin email" ON public.admin_emails;
DROP POLICY IF EXISTS "Admins can view all admin emails" ON public.admin_emails;
DROP POLICY IF EXISTS "admin_emails_secure_select" ON public.admin_emails;

-- 3. Criar uma política SEGURA baseada apenas no JWT (Sem chamar funções externas)
-- Nota: Usando current_setting para máxima compatibilidade
CREATE POLICY "admin_emails_secure_select" 
ON public.admin_emails 
FOR SELECT 
TO authenticated 
USING (email = (current_setting('request.jwt.claims', true)::jsonb ->> 'email'));

-- 4. Reabilitar o RLS
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- 5. Corrigir a função is_admin() para evitar loops futuros
-- Usamos SECURITY DEFINER para que ela rode com privilégios de owner e ignore RLS da própria admin_emails se necessário
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_emails 
    WHERE email = (auth.jwt() ->> 'email')
  );
END;
$$;

-- 6. Garantir permissões de uso da função
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;
`;

async function runFix() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('🐘 Conectado ao Postgres. Aplicando hotfix...');
    await client.query(sql);
    console.log('✅ Hotfix de RLS aplicado com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao aplicar hotfix:', err.message);
  } finally {
    await client.end();
  }
}

runFix();
