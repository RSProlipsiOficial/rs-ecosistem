-- Tabela para configurações gerais da empresa/sistema
CREATE TABLE IF NOT EXISTS public.company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    n8n_url TEXT,
    n8n_api_key TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver e editar
CREATE POLICY "Admins can manage company settings" ON public.company_settings
FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_emails WHERE email = auth.jwt()->>'email'));

-- Inserir registro inicial se não existir
INSERT INTO public.company_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM public.company_settings);
