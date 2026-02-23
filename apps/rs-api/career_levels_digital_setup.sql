-- migration: create_career_levels_digital
-- description: Tabela para o novo Plano de Carreira Digital (Star System)

CREATE TABLE IF NOT EXISTS public.career_levels_digital (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    required_volume NUMERIC(15, 2) NOT NULL DEFAULT 0,
    
    -- RS Products Commissions
    commission_physical_rs NUMERIC(5, 2) NOT NULL DEFAULT 0,
    commission_rs_digital NUMERIC(5, 2) NOT NULL DEFAULT 0,
    
    -- Affiliate Products Commissions
    commission_physical_affiliate NUMERIC(5, 2) NOT NULL DEFAULT 0,
    commission_affiliate_digital_essential NUMERIC(5, 2) NOT NULL DEFAULT 0,
    commission_affiliate_digital_professional NUMERIC(5, 2) NOT NULL DEFAULT 0,
    commission_affiliate_digital_premium NUMERIC(5, 2) NOT NULL DEFAULT 0,
    
    award TEXT,
    pin_image TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.career_levels_digital ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
CREATE POLICY "Leitura pública para todos" ON public.career_levels_digital
    FOR SELECT USING (true);

CREATE POLICY "Acesso total para service_role" ON public.career_levels_digital
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_career_levels_digital_updated_at
    BEFORE UPDATE ON public.career_levels_digital
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Comentário da tabela
COMMENT ON TABLE public.career_levels_digital IS 'Tabela do Plano de Carreira Digital (Star System) focado em Drop e Afiliados.';
