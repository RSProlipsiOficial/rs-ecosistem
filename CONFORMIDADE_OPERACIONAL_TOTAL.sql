-- 🔍 RS PRÓLIPSI - CONFORMIDADE OPERACIONAL TOTAL
-- Objetivo: Alinhar Supabase com o Modelo Operacional Oficial

BEGIN;

-- 1. ESTRUTURA DOS 13 PINs (PLANO DE CARREIRA)
CREATE TABLE IF NOT EXISTS career_pins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    label VARCHAR(50) NOT NULL,
    nivel INTEGER NOT NULL,
    min_quarter_points INTEGER NOT NULL,
    min_active_directs INTEGER NOT NULL,
    vmec_percentages JSONB NOT NULL,
    reward DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Limpar tabela para reinserção de conformidade
TRUNCATE TABLE career_pins;

-- Inserir os 13 PINs Oficiais
INSERT INTO career_pins (code, label, nivel, min_quarter_points, min_active_directs, vmec_percentages, reward) VALUES
('PIN01', 'Bronze', 1, 5, 0, '[]', 13.50),
('PIN02', 'Prata', 2, 15, 1, '[100]', 40.50),
('PIN03', 'Ouro', 3, 70, 1, '[100]', 189.00),
('PIN04', 'Safira', 4, 150, 2, '[60, 40]', 405.00),
('PIN05', 'Esmeralda', 5, 300, 2, '[60, 40]', 810.00),
('PIN06', 'Topázio', 6, 500, 2, '[60, 40]', 1350.00),
('PIN07', 'Rubi', 7, 750, 3, '[50, 30, 20]', 2025.00),
('PIN08', 'Diamante', 8, 1500, 3, '[50, 30, 20]', 4050.00),
('PIN09', 'Duplo Diamante', 9, 3000, 4, '[40, 30, 20, 10]', 18450.00),
('PIN10', 'Triplo Diamante', 10, 5000, 5, '[35, 25, 20, 10, 10]', 36450.00),
('PIN11', 'Diamante Red', 11, 15000, 6, '[30, 20, 18, 12, 10, 10]', 67500.00),
('PIN12', 'Diamante Blue', 12, 25000, 6, '[30, 20, 18, 12, 10, 10]', 105300.00),
('PIN13', 'Diamante Black', 13, 50000, 6, '[30, 20, 18, 12, 10, 10]', 135000.00);

-- 2. AJUSTE BÔNUS FIDELIDADE (POOL DISTRIBUIÇÃO PONDERADA)
CREATE TABLE IF NOT EXISTS fidelity_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_pct DECIMAL(5,2) DEFAULT 1.25,
    levels_weights JSONB DEFAULT '[7, 8, 10, 15, 25, 35]',
    distribution_type TEXT DEFAULT 'weighted',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO fidelity_config (pool_pct, levels_weights, distribution_type) 
VALUES (1.25, '[7, 8, 10, 15, 25, 35]', 'weighted')
ON CONFLICT DO NOTHING;

-- 📊 Audit Log
INSERT INTO announcements (title, content, type) 
VALUES ('Conformidade Operacional', 'O sistema foi alinhado com o modelo operacional de 13 PINs e bônus de fidelidade ponderado.', 'system');

COMMIT;

-- ✅ SCRIPT CONCLUÍDO. EXECUTAR NO SQL EDITOR DO SUPABASE.
