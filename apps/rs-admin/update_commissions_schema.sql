-- Renomear coluna existente para commission_digital (assumindo que era a principal)
ALTER TABLE career_levels_digital RENAME COLUMN commission_percentage TO commission_digital;

-- Adicionar novas colunas para os outros tipos de comissão
ALTER TABLE career_levels_digital ADD COLUMN IF NOT EXISTS commission_physical DECIMAL(5,2) DEFAULT 0;
ALTER TABLE career_levels_digital ADD COLUMN IF NOT EXISTS commission_affiliate DECIMAL(5,2) DEFAULT 0;

-- Atualizar os valores com base no PRD (Valores extraídos da transcrição e PRD)

-- Nível 1: RS One Star
UPDATE career_levels_digital SET
    commission_digital = 30.0,
    commission_physical = 27.0,
    commission_affiliate = 8.0
WHERE name = 'RS One Star';

-- Nível 2: RS Two Star
UPDATE career_levels_digital SET
    commission_digital = 35.0,
    commission_physical = 30.0,
    commission_affiliate = 10.0
WHERE name = 'RS Two Star';

-- Nível 3: RS Three Star
UPDATE career_levels_digital SET
    commission_digital = 40.0,
    commission_physical = 33.0,
    commission_affiliate = 12.0
WHERE name = 'RS Three Star';

-- Nível 4: RS Pro Star
UPDATE career_levels_digital SET
    commission_digital = 45.0,
    commission_physical = 35.0,
    commission_affiliate = 12.0
WHERE name = 'RS Pro Star';

-- Nível 5: RS Prime Star
UPDATE career_levels_digital SET
    commission_digital = 50.0,
    commission_physical = 36.0,
    commission_affiliate = 15.0
WHERE name = 'RS Prime Star';

-- Nível 6: RS Elite Star
UPDATE career_levels_digital SET
    commission_digital = 55.0,
    commission_physical = 37.0,
    commission_affiliate = 15.0
WHERE name = 'RS Elite Star';

-- Nível 7: RS Legend Star
UPDATE career_levels_digital SET
    commission_digital = 60.0,
    commission_physical = 38.0,
    commission_affiliate = 15.0
WHERE name = 'RS Legend Star';
