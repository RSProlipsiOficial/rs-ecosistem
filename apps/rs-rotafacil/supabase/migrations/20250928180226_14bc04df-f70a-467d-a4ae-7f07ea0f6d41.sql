-- Criar tabela para controlar mensagens enviadas
CREATE TABLE public.mensalidades_mensagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pagamento_id UUID NOT NULL REFERENCES public.pagamentos_mensais(id) ON DELETE CASCADE,
  tipo_mensagem TEXT NOT NULL DEFAULT 'manual' CHECK (tipo_mensagem IN ('manual', 'automatica')),
  conteudo TEXT NOT NULL,
  enviada_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'enviada' CHECK (status IN ('enviada', 'falhou', 'pendente')),
  whatsapp_responsavel TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mensalidades_mensagens ENABLE ROW LEVEL SECURITY;

-- Create policies for mensalidades_mensagens
CREATE POLICY "Users can view their own mensagens" 
ON public.mensalidades_mensagens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mensagens" 
ON public.mensalidades_mensagens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Criar tabela para configurações de envio automático
CREATE TABLE public.mensalidades_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dias_antes_vencimento INTEGER DEFAULT 3,
  dias_apos_vencimento INTEGER DEFAULT 3,
  envio_automatico_ativo BOOLEAN DEFAULT false,
  mensagem_antes_vencimento TEXT DEFAULT 'Olá! A mensalidade de {aluno} vence em {dias} dias. Valor: {valor}. Pague via Pix: {pix}',
  mensagem_no_vencimento TEXT DEFAULT 'Olá! A mensalidade de {aluno} vence hoje. Valor: {valor}. Pague via Pix: {pix}',
  mensagem_apos_vencimento TEXT DEFAULT 'Atenção! A mensalidade de {aluno} está em atraso desde {dias} dias. Valor: {valor}. Regularize via Pix: {pix}',
  chave_pix TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.mensalidades_config ENABLE ROW LEVEL SECURITY;

-- Create policies for mensalidades_config
CREATE POLICY "Users can manage their own config" 
ON public.mensalidades_config 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_mensalidades_config_updated_at
  BEFORE UPDATE ON public.mensalidades_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar campos faltantes na tabela pagamentos_mensais se não existirem
DO $$ 
BEGIN
  -- Adicionar data_vencimento se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'pagamentos_mensais' 
                 AND column_name = 'data_vencimento') THEN
    ALTER TABLE public.pagamentos_mensais 
    ADD COLUMN data_vencimento DATE DEFAULT (date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day')::date;
  END IF;
END $$;