-- Criar sistema de créditos IA unificado
CREATE TABLE public.user_ai_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  creditos_usados INTEGER NOT NULL DEFAULT 0,
  limite_mensal INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, mes, ano)
);

-- Criar tabela para instâncias WhatsApp dos usuários
CREATE TABLE public.whatsapp_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  instance_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected',
  qr_code TEXT,
  phone_number TEXT,
  webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, instance_name)
);

-- Criar tabela para mensagens WhatsApp enviadas
CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  instance_id UUID NOT NULL REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE,
  to_number TEXT NOT NULL,
  message_content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  status TEXT NOT NULL DEFAULT 'pending',
  external_id TEXT,
  ai_generated BOOLEAN NOT NULL DEFAULT true,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_ai_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_ai_credits
CREATE POLICY "Users can view their own credits" 
ON public.user_ai_credits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" 
ON public.user_ai_credits 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para whatsapp_instances
CREATE POLICY "Users can manage their own instances" 
ON public.whatsapp_instances 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para whatsapp_messages
CREATE POLICY "Users can manage their own messages" 
ON public.whatsapp_messages 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Função para verificar e consumir créditos IA
CREATE OR REPLACE FUNCTION public.consume_ai_credit(p_user_id UUID, p_credits INTEGER DEFAULT 1)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mes INTEGER := EXTRACT(MONTH FROM CURRENT_DATE);
  v_ano INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
  v_creditos_usados INTEGER;
  v_limite_mensal INTEGER;
BEGIN
  -- Buscar ou criar registro do mês atual
  INSERT INTO public.user_ai_credits (user_id, mes, ano, creditos_usados, limite_mensal)
  VALUES (p_user_id, v_mes, v_ano, 0, 100)
  ON CONFLICT (user_id, mes, ano) DO NOTHING;
  
  -- Verificar créditos disponíveis
  SELECT creditos_usados, limite_mensal 
  INTO v_creditos_usados, v_limite_mensal
  FROM public.user_ai_credits
  WHERE user_id = p_user_id AND mes = v_mes AND ano = v_ano;
  
  -- Verificar se tem créditos suficientes
  IF v_limite_mensal = -1 OR (v_creditos_usados + p_credits) <= v_limite_mensal THEN
    -- Consumir créditos
    UPDATE public.user_ai_credits
    SET creditos_usados = creditos_usados + p_credits,
        updated_at = now()
    WHERE user_id = p_user_id AND mes = v_mes AND ano = v_ano;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_ai_credits_updated_at
  BEFORE UPDATE ON public.user_ai_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whatsapp_instances_updated_at
  BEFORE UPDATE ON public.whatsapp_instances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whatsapp_messages_updated_at
  BEFORE UPDATE ON public.whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();