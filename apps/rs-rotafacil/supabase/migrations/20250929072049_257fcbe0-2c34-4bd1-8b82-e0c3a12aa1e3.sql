-- Criar tabela para armazenar banners da landing page (somente se não existir)
CREATE TABLE IF NOT EXISTS public.landing_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  order_index INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS se a tabela foi criada
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'landing_banners'
  ) THEN
    ALTER TABLE public.landing_banners ENABLE ROW LEVEL SECURITY;
    
    -- Políticas para landing_banners
    CREATE POLICY "Público pode ver landing_banners"
    ON public.landing_banners FOR SELECT
    USING (true);

    CREATE POLICY "Admins podem gerenciar landing_banners"
    ON public.landing_banners FOR ALL
    USING (public.is_admin());

    -- Trigger para atualizar updated_at
    CREATE TRIGGER update_landing_banners_updated_at
    BEFORE UPDATE ON public.landing_banners
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;