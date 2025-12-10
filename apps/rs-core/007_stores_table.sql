-- ================================================
-- 7. TABELA: stores (Lojas dos Consultores)
-- ================================================
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_id UUID REFERENCES consultores(id) ON DELETE CASCADE,
    
    -- Identificação da Loja
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE, -- Para URLs amigáveis
    
    -- Links e Códigos
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    referral_link TEXT,
    affiliate_link TEXT,
    
    -- Customização (Futuro)
    banner_url TEXT,
    logo_url TEXT,
    theme_color VARCHAR(20),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
    
    -- Metadados
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Índices
    INDEX idx_consultant (consultant_id),
    INDEX idx_referral_code (referral_code)
);

-- Políticas RLS (Row Level Security)
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Leitura: Pública (para clientes acessarem a loja)
CREATE POLICY "Lojas são públicas" ON stores
    FOR SELECT USING (true);

-- Escrita: Apenas o dono (consultor) ou admin
CREATE POLICY "Consultores gerenciam suas lojas" ON stores
    FOR ALL USING (auth.uid() = consultant_id);
