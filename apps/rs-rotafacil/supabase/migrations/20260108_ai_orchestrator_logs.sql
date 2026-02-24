-- Tabela para armazenar o histórico de gerações do Orquestrador IA
CREATE TABLE IF NOT EXISTS public.ai_automation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    generated_workflow JSONB,
    n8n_response JSONB,
    status TEXT DEFAULT 'pending', -- pending, success, error
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.ai_automation_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (Apenas Admins)
CREATE POLICY "Admins can view all automation logs" ON public.ai_automation_logs
FOR SELECT USING (EXISTS (SELECT 1 FROM public.admin_emails WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Admins can insert automation logs" ON public.ai_automation_logs
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.admin_emails WHERE email = auth.jwt()->>'email'));

-- Trigger para updated_at se necessário (embora seja apenas log)
