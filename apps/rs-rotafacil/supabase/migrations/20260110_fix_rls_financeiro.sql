-- Hotfix: Restaurar visibilidade do Fluxo de Caixa (RLS)
-- Data: 10/01/2026

-- 1. Políticas para lancamentos_financeiros
DROP POLICY IF EXISTS "lancamentos_selective_read" ON lancamentos_financeiros;
DROP POLICY IF EXISTS "lancamentos_insert_owner" ON lancamentos_financeiros;
DROP POLICY IF EXISTS "lancamentos_update_owner" ON lancamentos_financeiros;
DROP POLICY IF EXISTS "lancamentos_delete_owner" ON lancamentos_financeiros;

-- Permissões de Leitura (Sempre incluir Admins)
CREATE POLICY "lancamentos_selective_read" ON lancamentos_financeiros
FOR SELECT TO authenticated
USING (
  (auth.uid() = user_id) OR 
  (EXISTS (SELECT 1 FROM admin_emails WHERE email = auth.jwt()->>'email'))
);

-- Permissões de Escrita (Inserir)
CREATE POLICY "lancamentos_insert_owner" ON lancamentos_financeiros
FOR INSERT TO authenticated
WITH CHECK (
  (auth.uid() = user_id) OR 
  (EXISTS (SELECT 1 FROM admin_emails WHERE email = auth.jwt()->>'email'))
);

-- Permissões de Atualização (Update)
CREATE POLICY "lancamentos_update_owner" ON lancamentos_financeiros
FOR UPDATE TO authenticated
USING (
  (auth.uid() = user_id) OR 
  (EXISTS (SELECT 1 FROM admin_emails WHERE email = auth.jwt()->>'email'))
)
WITH CHECK (
  (auth.uid() = user_id) OR 
  (EXISTS (SELECT 1 FROM admin_emails WHERE email = auth.jwt()->>'email'))
);

-- Permissões de Exclusão (Delete)
CREATE POLICY "lancamentos_delete_owner" ON lancamentos_financeiros
FOR DELETE TO authenticated
USING (
  (auth.uid() = user_id) OR 
  (EXISTS (SELECT 1 FROM admin_emails WHERE email = auth.jwt()->>'email'))
);

-- 2. Garantir que RLS esteja habilitado
ALTER TABLE lancamentos_financeiros ENABLE ROW LEVEL SECURITY;
