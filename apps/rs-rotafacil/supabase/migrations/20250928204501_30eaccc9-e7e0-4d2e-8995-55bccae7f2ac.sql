-- Create storage bucket for landing page assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('landing-assets', 'landing-assets', true);

-- Create table for landing page content
CREATE TABLE public.landing_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section text NOT NULL,
  content_key text NOT NULL,
  content_type text NOT NULL DEFAULT 'text',
  content_value text,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(section, content_key)
);

-- Enable RLS
ALTER TABLE public.landing_content ENABLE ROW LEVEL SECURITY;

-- RLS policies - only authenticated users can manage landing content
CREATE POLICY "Authenticated users can view landing content" 
ON public.landing_content FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage landing content" 
ON public.landing_content FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Storage policies for landing assets
CREATE POLICY "Public can view landing assets" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'landing-assets');

CREATE POLICY "Authenticated users can upload landing assets" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'landing-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update landing assets" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'landing-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete landing assets" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'landing-assets' AND auth.uid() IS NOT NULL);

-- Insert default content
INSERT INTO public.landing_content (section, content_key, content_type, content_value) VALUES
('hero', 'title', 'text', 'Gerencie sua Frota Escolar de forma Inteligente'),
('hero', 'subtitle', 'text', 'O sistema completo para motoristas e monitoras de transporte escolar. Controle financeiro, segurança, comunicação automática e muito mais.'),
('hero', 'cta_button', 'text', 'Cadastrar Agora'),
('hero', 'demo_button', 'text', 'Ver Demonstração'),
('features', 'title', 'text', 'Tudo que você precisa em um só lugar'),
('features', 'subtitle', 'text', 'O RotaFácil oferece todas as ferramentas necessárias para gerenciar seu transporte escolar de forma profissional e eficiente.'),
('benefits', 'title', 'text', 'Por que escolher o RotaFácil?'),
('benefits', 'subtitle', 'text', 'Mais de 200 motoristas já confiam no RotaFácil para gerenciar seus negócios de transporte escolar.'),
('cta', 'title', 'text', 'Pronto para revolucionar seu transporte escolar?'),
('cta', 'subtitle', 'text', 'Junte-se a centenas de motoristas que já transformaram seus negócios com o RotaFácil. Comece hoje mesmo, é grátis!'),
('cta', 'button', 'text', 'Cadastrar Agora - É Gratuito');

-- Add trigger for updated_at
CREATE TRIGGER update_landing_content_updated_at
    BEFORE UPDATE ON public.landing_content
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();