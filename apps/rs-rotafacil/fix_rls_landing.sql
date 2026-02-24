-- Garante que a tabela landing_content seja legível publicamente
ALTER TABLE landing_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura pública de landing_content" ON landing_content;
CREATE POLICY "Permitir leitura pública de landing_content" 
ON landing_content FOR SELECT 
USING (true);

-- Garante que o Admin possa editar
DROP POLICY IF EXISTS "Permitir tudo para usuários autenticados" ON landing_content;
CREATE POLICY "Permitir tudo para usuários autenticados" 
ON landing_content FOR ALL 
TO authenticated 
USING (true);
