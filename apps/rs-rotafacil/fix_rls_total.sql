-- 1. Garante que a tabela tenha RLS (Segurança) mas permita leitura pública
ALTER TABLE landing_content ENABLE ROW LEVEL SECURITY;

-- 2. Remove políticas antigas que podem estar bloqueando
DROP POLICY IF EXISTS "Permitir leitura pública de landing_content" ON landing_content;
DROP POLICY IF EXISTS "Public View" ON landing_content;
DROP POLICY IF EXISTS "Enable read access for all users" ON landing_content;

-- 3. Cria a política que permite que TODO MUNDO (inclusive quem não está logado) veja o site
CREATE POLICY "Permitir leitura pública de landing_content" 
ON landing_content FOR SELECT 
USING (true);

-- 4. Garante que o usuário autenticado possa salvar (Admin)
DROP POLICY IF EXISTS "Permitir tudo para usuários autenticados" ON landing_content;
CREATE POLICY "Permitir tudo para usuários autenticados" 
ON landing_content FOR ALL 
TO authenticated 
USING (true);

-- 5. Insere os dados corretos agora mesmo para teste
DELETE FROM landing_content WHERE section = 'footer' AND content_key IN ('phone', 'email', 'address');

INSERT INTO landing_content (section, content_key, content_value, content_type)
VALUES 
('footer', 'phone', '(41) 9 9286-3922', 'text'),
('footer', 'email', 'rsrotafacil@gmail.com', 'text'),
('footer', 'address', 'Piraquara-Pr', 'text');
