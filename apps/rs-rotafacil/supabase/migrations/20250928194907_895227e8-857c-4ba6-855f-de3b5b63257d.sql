-- Tabela para armazenar os planejamentos financeiros dos usuários
CREATE TABLE public.planejamentos_financeiros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  renda_mensal NUMERIC NOT NULL DEFAULT 0,
  gastos_casa NUMERIC NOT NULL DEFAULT 0,
  lazer NUMERIC NOT NULL DEFAULT 0,
  educacao NUMERIC NOT NULL DEFAULT 0,
  investimentos NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Tabela para armazenar os vídeos educativos
CREATE TABLE public.videos_educativos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  thumbnail TEXT,
  youtube_url TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('Fundamentos', 'Planejamento', 'Redução de Gastos', 'Investimento básico', 'Mentalidade financeira')),
  duracao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.planejamentos_financeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos_educativos ENABLE ROW LEVEL SECURITY;

-- Políticas para planejamentos_financeiros
CREATE POLICY "Users can view their own financial plans" 
ON public.planejamentos_financeiros 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own financial plans" 
ON public.planejamentos_financeiros 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial plans" 
ON public.planejamentos_financeiros 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial plans" 
ON public.planejamentos_financeiros 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para videos_educativos (todos podem ver vídeos ativos)
CREATE POLICY "Anyone can view active educational videos" 
ON public.videos_educativos 
FOR SELECT 
USING (ativo = true);

-- Admins podem gerenciar vídeos (futuramente implementar)
-- CREATE POLICY "Admins can manage educational videos" 
-- ON public.videos_educativos 
-- FOR ALL 
-- USING (is_admin());

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_planejamentos_financeiros_updated_at
BEFORE UPDATE ON public.planejamentos_financeiros
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_videos_educativos_updated_at
BEFORE UPDATE ON public.videos_educativos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir alguns vídeos de exemplo
INSERT INTO public.videos_educativos (titulo, descricao, youtube_url, categoria, duracao) VALUES
('Como dividir seu salário todo mês', 'Aprenda a organizar sua renda mensal de forma inteligente', 'https://youtube.com/watch?v=exemplo1', 'Fundamentos', '15 min'),
('Controle de Gastos Simples', 'Técnicas práticas para reduzir gastos desnecessários', 'https://youtube.com/watch?v=exemplo2', 'Planejamento', '12 min'),
('Começando a Investir do Zero', 'Primeiros passos para fazer seu dinheiro trabalhar para você', 'https://youtube.com/watch?v=exemplo3', 'Investimento básico', '20 min'),
('Mentalidade de Sucesso Financeiro', 'Mudança de mindset para alcançar a liberdade financeira', 'https://youtube.com/watch?v=exemplo4', 'Mentalidade financeira', '18 min'),
('Cortando Gastos Desnecessários', 'Identifique e elimine despesas que não agregam valor', 'https://youtube.com/watch?v=exemplo5', 'Redução de Gastos', '14 min');