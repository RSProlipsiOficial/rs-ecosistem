-- Migração: Upgrade do Sistema de IA (Prompts Dinâmicos e Contexto)

-- 1. Tabela de Prompts Globais/Templates
CREATE TABLE IF NOT EXISTS public.ai_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL, -- ex: 'cobranca_padrao', 'suporte_saudacao', 'lembrete_vencimento'
    name TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL, -- O prompt em si
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Expandir Configuração de IA para Tenants
ALTER TABLE public.ai_configuration 
ADD COLUMN IF NOT EXISTS ai_voice_tone TEXT DEFAULT 'profissional e amigável',
ADD COLUMN IF NOT EXISTS custom_instructions TEXT,
ADD COLUMN IF NOT EXISTS auto_reply_enabled BOOLEAN DEFAULT false;

-- 3. Tabela de Logs Detalhados de IA
CREATE TABLE IF NOT EXISTS public.ai_interaction_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    prompt_slug TEXT,
    request_payload JSONB,
    response_content TEXT,
    tokens_used INTEGER,
    status TEXT, -- 'success', 'error'
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Inserir Prompts Iniciais
INSERT INTO public.ai_prompts (slug, name, description, content) VALUES
(
    'cobranca_proativa', 
    'Cobrança Proativa', 
    'Prompt para envio de faturas e cobrança de alunos.',
    'Você é um assistente virtual especializado em atendimento financeiro para transporte escolar.
Seu objetivo é gerar uma mensagem de cobrança cordial.
Dados: Aluno {aluno}, Valor {valor}, Vencimento {vencimento}.
Tom de voz: {tom_voz}.
Instruções adicionais: {instrucoes_custom}.
Se o pagamento estiver atrasado, mencione suavemente. Se for lembrete, use tom preventivo.
Sempre inclua o PIX Copia e Cola: {pix_code}'
),
(
    'feedback_suporte',
    'Saudação de Suporte',
    'Prompt para responder dúvidas básicas de suporte.',
    'Você é o assistente de suporte do Rota Fácil. 
Responda de forma prestativa e rápida. 
Se não souber a resposta, direcione para o suporte humano.'
)
ON CONFLICT (slug) DO NOTHING;

-- 5. Função para atualizar timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger para ai_prompts
CREATE TRIGGER set_ai_prompts_updated_at
BEFORE UPDATE ON public.ai_prompts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 7. Habilitar RLS
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interaction_logs ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Admins can manage prompts" ON public.ai_prompts
    FOR ALL USING (is_admin());

CREATE POLICY "Users can view active prompts" ON public.ai_prompts
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own AI logs" ON public.ai_interaction_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all AI logs" ON public.ai_interaction_logs
    FOR SELECT USING (is_admin());
