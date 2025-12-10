-- Criar bucket para assets da landing page se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'landing-assets', 
  'landing-assets', 
  true, 
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas para o bucket landing-assets
CREATE POLICY "Acesso público para visualizar assets da landing" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'landing-assets');

CREATE POLICY "Usuários autenticados podem fazer upload de assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'landing-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'landing-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'landing-assets' AND auth.uid() IS NOT NULL);