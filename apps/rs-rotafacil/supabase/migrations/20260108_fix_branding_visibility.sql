-- Habilitar RLS nas tabelas se ainda não estiverem
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Limpar políticas de SELECT existentes para evitar conflitos (opcional, mas recomendado para clareza)
-- DROP POLICY IF EXISTS "Public branding access" ON public.app_settings;
-- DROP POLICY IF EXISTS "Public landing content access" ON public.landing_content;
-- DROP POLICY IF EXISTS "Public landing banners access" ON public.landing_banners;
-- DROP POLICY IF EXISTS "Public site config access" ON public.site_config;

-- 1. Tabela app_settings: Permitir leitura pública apenas de chaves não sensíveis
CREATE POLICY "Public branding access" ON public.app_settings
FOR SELECT USING (key IN ('branding', 'demo_config'));

-- 2. Tabela landing_content: Permitir leitura pública de todo o conteúdo
CREATE POLICY "Public landing content access" ON public.landing_content
FOR SELECT USING (true);

-- 3. Tabela landing_banners: Permitir leitura pública de todos os banners
CREATE POLICY "Public landing banners access" ON public.landing_banners
FOR SELECT USING (true);

-- 4. Tabela site_config: Permitir leitura pública da configuração do site
CREATE POLICY "Public site config access" ON public.site_config
FOR SELECT USING (true);

-- Nota: As políticas de "Admin access only" (is_admin()) para INSERT/UPDATE/DELETE devem ser mantidas conforme já existem.
