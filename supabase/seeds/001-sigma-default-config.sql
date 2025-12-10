-- ============================================================================
-- RS PRÓLIPSI - SEED DE CONFIGURAÇÃO PADRÃO DO SIGMA
-- ============================================================================
-- Arquivo: supabase/seeds/001-sigma-default-config.sql
-- Propósito: Inicializar tabelas de configuração com valores padrão
-- ATENÇÃO: Executar APÓS a migration rs-backend-sync-001.sql
-- NÃO EXECUTAR AUTOMATICAMENTE - Revisar e aplicar manualmente no Supabase
-- ============================================================================

-- ============================================================================
-- 1. SIGMA_SETTINGS - Configuração Principal
-- ============================================================================

-- Inserir registro padrão (apenas se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sigma_settings LIMIT 1) THEN
        INSERT INTO sigma_settings (
            cycle_value,
            cycle_payout_value,
            cycle_payout_percent,
            reentry_enabled,
            reentry_limit_per_month,
            spillover_mode,
            fidelity_source_percent,
            top_pool_percent,
            career_percent,
            updated_at
        ) VALUES (
            360.00,          -- Valor do ciclo (R$ 360)
            108.00,          -- Payout do ciclo (30% de 360 = R$ 108)
            30,              -- Percentual de payout (30%)
            true,            -- Reentrada automática habilitada
            10,              -- Limite de reentradas por mês
            'linha_ascendente', -- Modo de spillover
            1.25,            -- Percentual do pool de fidelidade (1.25%)
            4.5,             -- Percentual do pool Top SIGMA (4.5%)
            6.39,            -- Percentual de bônus de carreira (6.39%)
            NOW()
        );
        RAISE NOTICE 'sigma_settings: Registro padrão criado com sucesso';
    ELSE
        RAISE NOTICE 'sigma_settings: Já existe configuração, pulando inserção';
    END IF;
END $$;

-- ============================================================================
-- 2. SIGMA_DEPTH_LEVELS - Níveis de Profundidade (L1-L6)
-- ============================================================================

-- Obter o settings_id recém-criado
DO $$
DECLARE
    v_settings_id UUID;
    v_cycle_value NUMERIC := 360.00;
    v_base_pool NUMERIC := 6.81; -- 6.81% do valor do ciclo
    v_pool_value NUMERIC;
BEGIN
    -- Buscar settings_id da configuração atual
    SELECT id INTO v_settings_id FROM sigma_settings ORDER BY updated_at DESC LIMIT 1;
    
    IF v_settings_id IS NULL THEN
        RAISE EXCEPTION 'Nenhuma configuração encontrada em sigma_settings';
    END IF;

    -- Calcular valor do pool de profundidade
    v_pool_value := v_cycle_value * (v_base_pool / 100); -- R$ 24.52

    -- Verificar se já existem níveis cadastrados para este settings_id
    IF NOT EXISTS (SELECT 1 FROM sigma_depth_levels WHERE settings_id = v_settings_id) THEN
        -- Inserir os 6 níveis de profundidade com distribuição percentual
        INSERT INTO sigma_depth_levels (settings_id, level, percent, value_per_cycle, order_index) VALUES
            (v_settings_id, 1, 7.00,  v_pool_value * 0.07,  0),  -- L1: 7%  = R$ 1.72
            (v_settings_id, 2, 8.00,  v_pool_value * 0.08,  1),  -- L2: 8%  = R$ 1.96
            (v_settings_id, 3, 10.00, v_pool_value * 0.10,  2),  -- L3: 10% = R$ 2.45
            (v_settings_id, 4, 15.00, v_pool_value * 0.15,  3),  -- L4: 15% = R$ 3.68
            (v_settings_id, 5, 25.00, v_pool_value * 0.25,  4),  -- L5: 25% = R$ 6.13
            (v_settings_id, 6, 35.00, v_pool_value * 0.35,  5);  -- L6: 35% = R$ 8.58
        
        RAISE NOTICE 'sigma_depth_levels: 6 níveis de profundidade criados';
    ELSE
        RAISE NOTICE 'sigma_depth_levels: Níveis já existem, pulando inserção';
    END IF;
END $$;

-- ============================================================================
-- 3. SIGMA_FIDELITY_LEVELS - Níveis de Fidelidade (L1-L6)
-- ============================================================================

DO $$
DECLARE
    v_settings_id UUID;
    v_cycle_value NUMERIC := 360.00;
    v_fidelity_percent NUMERIC := 1.25; -- 1.25% do valor do ciclo
    v_pool_value NUMERIC;
BEGIN
    SELECT id INTO v_settings_id FROM sigma_settings ORDER BY updated_at DESC LIMIT 1;
    
    IF v_settings_id IS NULL THEN
        RAISE EXCEPTION 'Nenhuma configuração encontrada em sigma_settings';
    END IF;

    -- Calcular valor do pool de fidelidade
    v_pool_value := v_cycle_value * (v_fidelity_percent / 100); -- R$ 4.50

    IF NOT EXISTS (SELECT 1 FROM sigma_fidelity_levels WHERE settings_id = v_settings_id) THEN
        -- Inserir os 6 níveis de fidelidade (mesma distribuição da profundidade)
        INSERT INTO sigma_fidelity_levels (settings_id, level, percent, value_per_cycle, order_index) VALUES
            (v_settings_id, 1, 7.00,  v_pool_value * 0.07,  0),  -- L1: 7%  = R$ 0.32
            (v_settings_id, 2, 8.00,  v_pool_value * 0.08,  1),  -- L2: 8%  = R$ 0.36
            (v_settings_id, 3, 10.00, v_pool_value * 0.10,  2),  -- L3: 10% = R$ 0.45
            (v_settings_id, 4, 15.00, v_pool_value * 0.15,  3),  -- L4: 15% = R$ 0.68
            (v_settings_id, 5, 25.00, v_pool_value * 0.25,  4),  -- L5: 25% = R$ 1.13
            (v_settings_id, 6, 35.00, v_pool_value * 0.35,  5);  -- L6: 35% = R$ 1.58
        
        RAISE NOTICE 'sigma_fidelity_levels: 6 níveis de fidelidade criados';
    ELSE
        RAISE NOTICE 'sigma_fidelity_levels: Níveis já existem, pulando inserção';
    END IF;
END $$;

-- ============================================================================
-- 4. SIGMA_TOP10_LEVELS - Rankings Top SIGMA (1-10)
-- ============================================================================

DO $$
DECLARE
    v_settings_id UUID;
    v_top_pool_percent NUMERIC := 4.5; -- 4.5% pool total
BEGIN
    SELECT id INTO v_settings_id FROM sigma_settings ORDER BY updated_at DESC LIMIT 1;
    
    IF v_settings_id IS NULL THEN
        RAISE EXCEPTION 'Nenhuma configuração encontrada em sigma_settings';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM sigma_top10_levels WHERE settings_id = v_settings_id) THEN
        -- Inserir os 10 ranks do Top SIGMA com distribuição percentual do pool
        INSERT INTO sigma_top10_levels (settings_id, rank, percent_of_pool, pool_percent_base, order_index) VALUES
            (v_settings_id,  1, 2.00,  v_top_pool_percent, 0),   -- 1º: 2.0% do pool global
            (v_settings_id,  2, 1.50,  v_top_pool_percent, 1),   -- 2º: 1.5%
            (v_settings_id,  3, 1.20,  v_top_pool_percent, 2),   -- 3º: 1.2%
            (v_settings_id,  4, 1.00,  v_top_pool_percent, 3),   -- 4º: 1.0%
            (v_settings_id,  5, 0.80,  v_top_pool_percent, 4),   -- 5º: 0.8%
            (v_settings_id,  6, 0.70,  v_top_pool_percent, 5),   -- 6º: 0.7%
            (v_settings_id,  7, 0.60,  v_top_pool_percent, 6),   -- 7º: 0.6%
            (v_settings_id,  8, 0.50,  v_top_pool_percent, 7),   -- 8º: 0.5%
            (v_settings_id,  9, 0.40,  v_top_pool_percent, 8),   -- 9º: 0.4%
            (v_settings_id, 10, 0.30,  v_top_pool_percent, 9);   -- 10º: 0.3%
        
        RAISE NOTICE 'sigma_top10_levels: 10 ranks do Top SIGMA criados';
    ELSE
        RAISE NOTICE 'sigma_top10_levels: Ranks já existem, pulando inserção';
    END IF;
END $$;

-- ============================================================================
-- 5. SIGMA_CAREER_PINS - PINs de Carreira (13 níveis)
-- ============================================================================

DO $$
DECLARE
    v_settings_id UUID;
BEGIN
    SELECT id INTO v_settings_id FROM sigma_settings ORDER BY updated_at DESC LIMIT 1;
    
    IF v_settings_id IS NULL THEN
        RAISE EXCEPTION 'Nenhuma configuração encontrada em sigma_settings';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM sigma_career_pins WHERE settings_id = v_settings_id) THEN
        -- Inserir os 13 PINs de carreira conforme plano oficial
        INSERT INTO sigma_career_pins (settings_id, name, cycles_required, min_lines_required, vmec_distribution, reward_value, order_index) VALUES
            (v_settings_id, 'Bronze',            5,     0, '[]',                      13.50,     0),
            (v_settings_id, 'Prata',            15,     1, '[100]',                   40.50,     1),
            (v_settings_id, 'Ouro',             70,     1, '[100]',                  189.00,     2),
            (v_settings_id, 'Safira',          150,     2, '[60,40]',                405.00,     3),
            (v_settings_id, 'Esmeralda',       300,     2, '[60,40]',                810.00,     4),
            (v_settings_id, 'Topázio',         500,     2, '[60,40]',               1350.00,     5),
            (v_settings_id, 'Rubi',            750,     3, '[50,30,20]',            2025.00,     6),
            (v_settings_id, 'Diamante',       1500,     3, '[50,30,20]',            4050.00,     7),
            (v_settings_id, 'Duplo Diamante', 3000,     4, '[40,30,20,10]',        18450.00,     8),
            (v_settings_id, 'Triplo Diamante',5000,     5, '[35,25,20,10,10]',     36450.00,     9),
            (v_settings_id, 'Diamante Red',  15000,     6, '[30,20,18,12,10,10,1]',67500.00,    10),
            (v_settings_id, 'Diamante Blue', 25000,     6, '[30,20,18,12,10,10,1]',105300.00,   11),
            (v_settings_id, 'Diamante Black',50000,     6, '[30,20,18,12,10,10,1]',135000.00,   12);
        
        RAISE NOTICE 'sigma_career_pins: 13 PINs de carreira criados';
    ELSE
        RAISE NOTICE 'sigma_career_pins: PINs já existem, pulando inserção';
    END IF;
END $$;

-- ============================================================================
-- 6. VALIDAÇÃO FINAL
-- ============================================================================

-- Exibir resumo das configurações inseridas
DO $$
DECLARE
    v_settings_count INTEGER;
    v_depth_count INTEGER;
    v_fidelity_count INTEGER;
    v_top_count INTEGER;
    v_career_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_settings_count FROM sigma_settings;
    SELECT COUNT(*) INTO v_depth_count FROM sigma_depth_levels;
    SELECT COUNT(*) INTO v_fidelity_count FROM sigma_fidelity_levels;
    SELECT COUNT(*) INTO v_top_count FROM sigma_top10_levels;
    SELECT COUNT(*) INTO v_career_count FROM sigma_career_pins;

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE 'RESUMO DO SEED - CONFIGURAÇÃO SIGMA';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE 'sigma_settings:        % registro(s)', v_settings_count;
    RAISE NOTICE 'sigma_depth_levels:    % registro(s) (esperado: 6)', v_depth_count;
    RAISE NOTICE 'sigma_fidelity_levels: % registro(s) (esperado: 6)', v_fidelity_count;
    RAISE NOTICE 'sigma_top10_levels:    % registro(s) (esperado: 10)', v_top_count;
    RAISE NOTICE 'sigma_career_pins:     % registro(s) (esperado: 13)', v_career_count;
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    
    IF v_settings_count = 0 THEN
        RAISE WARNING 'ATENÇÃO: Nenhuma configuração principal foi criada!';
    END IF;

    IF v_depth_count != 6 THEN
        RAISE WARNING 'ATENÇÃO: Esperado 6 níveis de profundidade, encontrado %', v_depth_count;
    END IF;

    IF v_fidelity_count != 6 THEN
        RAISE WARNING 'ATENÇÃO: Esperado 6 níveis de fidelidade, encontrado %', v_fidelity_count;
    END IF;

    IF v_top_count != 10 THEN
        RAISE WARNING 'ATENÇÃO: Esperado 10 ranks Top SIGMA, encontrado %', v_top_count;
    END IF;

    IF v_career_count != 13 THEN
        RAISE WARNING 'ATENÇÃO: Esperado 13 PINs de carreira, encontrado %', v_career_count;
    END IF;
END $$;

-- ============================================================================
-- FIM DO SEED
-- ============================================================================
-- ✅ Seed executado com sucesso!
-- ✅ O painel admin agora pode ler e modificar estas configurações
-- ✅ rs-core lerá via getRule('SIGMA', 'CYCLE_VALUE') e outros
-- ============================================================================
