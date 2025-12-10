-- Inserir email do administrador
INSERT INTO public.admin_emails (email) 
VALUES ('rsprolipsioficial@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Criar tabela para controle de apps vendidos
CREATE TABLE IF NOT EXISTS public.apps_vendidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_cliente TEXT NOT NULL,
  email_cliente TEXT NOT NULL,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'ativo',
  observacoes TEXT,
  valor_pago NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.apps_vendidos ENABLE ROW LEVEL SECURITY;

-- Política para admins
CREATE POLICY "Admins can manage apps vendidos" 
ON public.apps_vendidos 
FOR ALL 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- Criar tabela para site principal
CREATE TABLE IF NOT EXISTS public.site_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_url TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Política para admins
CREATE POLICY "Admins can manage site config" 
ON public.site_config 
FOR ALL 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- Criar tabela para vídeos de educação financeira
CREATE TABLE IF NOT EXISTS public.videos_educacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  link_video TEXT NOT NULL,
  thumbnail_url TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.videos_educacao ENABLE ROW LEVEL SECURITY;

-- Política para admins gerenciarem e usuários visualizarem
CREATE POLICY "Admins can manage videos educacao" 
ON public.videos_educacao 
FOR ALL 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

CREATE POLICY "Users can view active videos educacao" 
ON public.videos_educacao 
FOR SELECT 
USING (ativo = true);

-- Criar tabela para tutoriais
CREATE TABLE IF NOT EXISTS public.tutoriais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  link_tutorial TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'video', -- video, pdf, link
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.tutoriais ENABLE ROW LEVEL SECURITY;

-- Política para admins gerenciarem e usuários visualizarem
CREATE POLICY "Admins can manage tutoriais" 
ON public.tutoriais 
FOR ALL 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

CREATE POLICY "Users can view active tutoriais" 
ON public.tutoriais 
FOR SELECT 
USING (ativo = true);

-- Criar tabela para configurações de suporte
CREATE TABLE IF NOT EXISTS public.suporte_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mensagem_suporte TEXT NOT NULL,
  whatsapp_suporte TEXT,
  link_video_principal TEXT,
  email_suporte TEXT,
  horario_atendimento TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.suporte_config ENABLE ROW LEVEL SECURITY;

-- Política para admins
CREATE POLICY "Admins can manage suporte config" 
ON public.suporte_config 
FOR ALL 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- Inserir configurações padrão
INSERT INTO public.site_config (site_url, descricao) 
VALUES ('https://rotafacil.app', 'Site principal do Rota Fácil')
ON CONFLICT DO NOTHING;

INSERT INTO public.suporte_config (mensagem_suporte, whatsapp_suporte) 
VALUES ('Entre em contato conosco para suporte técnico', '+5511999999999')
ON CONFLICT DO NOTHING;

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_apps_vendidos_updated_at BEFORE UPDATE ON public.apps_vendidos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON public.site_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_videos_educacao_updated_at BEFORE UPDATE ON public.videos_educacao FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tutoriais_updated_at BEFORE UPDATE ON public.tutoriais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suporte_config_updated_at BEFORE UPDATE ON public.suporte_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();