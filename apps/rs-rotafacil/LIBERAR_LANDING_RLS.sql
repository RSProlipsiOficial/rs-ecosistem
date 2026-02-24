-- EXECUTE ESTE SCRIPT NO SQL EDITOR DO SEU SUPABASE DASHBOARD
-- PARA RESOLVER O ERRO 401 (UNAUTHORIZED) NA LANDING PAGE

-- 1. Habilitar RLS nas tabelas (por segurança)
ALTER TABLE public.landing_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_banners ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Acesso público landing_content" ON public.landing_content;
DROP POLICY IF EXISTS "Acesso público landing_banners" ON public.landing_banners;

-- 3. Criar políticas de leitura pública (ANON)
CREATE POLICY "Acesso público landing_content" 
ON public.landing_content 
FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Acesso público landing_banners" 
ON public.landing_banners 
FOR SELECT 
TO anon 
USING (true);

-- 4. Notificar sucesso
-- Agora o erro 401 na landing page deve desaparecer!
