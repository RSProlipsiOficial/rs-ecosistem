-- ====================================
-- SCRIPT PARA CORRIGIR DADOS DA LANDING PAGE
-- ====================================

-- 1. Ver dados atuais
SELECT section, content_key, content_value 
FROM landing_content 
WHERE section = 'footer'
ORDER BY content_key;

-- 2. Deletar dados antigos do footer (se existirem)
DELETE FROM landing_content WHERE section = 'footer';

-- 3. Inserir dados corretos do footer
INSERT INTO landing_content (section, content_key, content_value, content_type) 
VALUES 
  ('footer', 'phone', '(41) 9928639-3922', 'text'),
  ('footer', 'email', 'rsrotafacil@gmail.com', 'text'),
  ('footer', 'address', 'Piraquara-Pr', 'text'),
  ('footer', 'description', 'O sistema completo para gestão de transporte escolar.', 'text'),
  ('footer', 'copyright', '© 2026 RS Prólipsi. Todos os direitos reservados.', 'text'),
  ('footer', 'terms_label', 'Termos de Uso', 'text'),
  ('footer', 'terms_url', '/termos-de-uso', 'text'),
  ('footer', 'privacy_label', 'Política de Privacidade', 'text'),
  ('footer', 'privacy_url', '/politica-privacidade', 'text')
ON CONFLICT (section, content_key) 
DO UPDATE SET 
  content_value = EXCLUDED.content_value,
  updated_at = NOW();

-- 4. Verificar se inseriu corretamente
SELECT section, content_key, content_value 
FROM landing_content 
WHERE section = 'footer'
ORDER BY content_key;
