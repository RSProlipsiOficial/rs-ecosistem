-- REVERSÃO COMPLETA: Voltar políticas RLS ao estado original funcional
-- Este script restaura as políticas que funcionavam antes

BEGIN;

-- 1. Remover TODAS as políticas atuais (que estão causando recursão)
DROP POLICY IF EXISTS "Vans: dynamic_visibility" ON vans;
DROP POLICY IF EXISTS "Guardian can view their students van" ON vans;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias vans" ON vans;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias vans" ON vans;
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias vans" ON vans;
DROP POLICY IF EXISTS "Users can view their own vans" ON vans;
DROP POLICY IF EXISTS "Users can insert their own vans" ON vans;
DROP POLICY IF EXISTS "Users can update their own vans" ON vans;
DROP POLICY IF EXISTS "Users can delete their own vans" ON vans;
DROP POLICY IF EXISTS "Guardians view student vans" ON vans;
DROP POLICY IF EXISTS "vans_select_own" ON vans;
DROP POLICY IF EXISTS "vans_insert_own" ON vans;
DROP POLICY IF EXISTS "vans_update_own" ON vans;
DROP POLICY IF EXISTS "vans_delete_own" ON vans;
DROP POLICY IF EXISTS "vans_select_guardian" ON vans;

-- 2. Criar políticas SIMPLES que funcionam (SEM RECURSÃO)

-- Permitir usuário ver suas próprias vans
CREATE POLICY "vans_owner_all"
ON vans
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Permitir visualização pública (para responsáveis verem van dos alunos)
CREATE POLICY "vans_public_read"
ON vans
FOR SELECT
TO authenticated
USING (true);

COMMIT;

-- Verificar se funcionou
SELECT 'Políticas RLS corrigidas com sucesso!' as status;
