-- ================================================
-- RS PRÓLIPSI - VIEWS E TRIGGERS AUTOMÁTICOS
-- Otimizações e automações no Supabase
-- ================================================

-- ================================================
-- VIEW 1: vw_active_cycles
-- Mostra todos os ciclos ativos com progresso
-- ================================================

CREATE OR REPLACE VIEW vw_active_cycles AS
SELECT
    mc.id AS cycle_id,
    mc.consultor_id,
    c.nome AS consultor_nome,
    mc.cycle_number,
    mc.slots_filled,
    mc.slots_total,
    ROUND((mc.slots_filled::DECIMAL / mc.slots_total) * 100, 2) AS progress_percent,
    mc.status,
    mc.cycle_value_total,
    mc.opened_at,
    EXTRACT(DAY FROM (NOW() - mc.opened_at)) AS days_open,
    CASE 
        WHEN mc.slots_filled = 0 THEN 'Novo'
        WHEN mc.slots_filled < 3 THEN 'Início'
        WHEN mc.slots_filled < 5 THEN 'Progredindo'
        WHEN mc.slots_filled = 5 THEN 'Quase Completo!'
        ELSE 'Completo'
    END AS status_label
FROM matriz_cycles mc
JOIN consultores c ON c.id = mc.consultor_id
WHERE mc.status = 'open'
ORDER BY mc.opened_at DESC;

-- ================================================
-- VIEW 2: vw_consultor_performance
-- Performance geral do consultor
-- ================================================

CREATE OR REPLACE VIEW vw_consultor_performance AS
SELECT
    c.id AS consultor_id,
    c.nome,
    c.email,
    c.pin_atual,
    c.pin_nivel,
    c.status,
    -- Ciclos
    COUNT(DISTINCT mc.id) FILTER (WHERE mc.status = 'completed') AS total_ciclos_completos,
    COUNT(DISTINCT mc.id) FILTER (WHERE mc.status = 'open') AS ciclos_abertos,
    -- Vendas
    COUNT(DISTINCT s.id) AS total_vendas,
    COALESCE(SUM(s.total_amount), 0) AS volume_total_vendas,
    -- Bônus
    COALESCE(SUM(b.valor) FILTER (WHERE b.status = 'pago'), 0) AS total_bonus_recebidos,
    COALESCE(SUM(b.valor) FILTER (WHERE b.status = 'pendente'), 0) AS bonus_pendentes,
    -- Carteira
    w.balance AS saldo_carteira,
    -- Rede
    COUNT(DISTINCT d.downline_id) AS total_downlines,
    COUNT(DISTINCT d.downline_id) FILTER (WHERE d.nivel = 1) AS total_diretos,
    -- Pontos
    cp.points_total AS pontos_carreira,
    cp.points_trimestre_atual AS pontos_trimestre,
    -- Datas
    c.data_ativacao,
    c.ultimo_ciclo,
    EXTRACT(DAY FROM (NOW() - c.data_ativacao)) AS dias_ativo
FROM consultores c
LEFT JOIN matriz_cycles mc ON mc.consultor_id = c.id
LEFT JOIN sales s ON s.buyer_id = c.id
LEFT JOIN bonuses b ON b.consultor_id = c.id
LEFT JOIN wallets w ON w.consultor_id = c.id
LEFT JOIN downlines d ON d.upline_id = c.id
LEFT JOIN career_points cp ON cp.consultor_id = c.id
WHERE c.status = 'ativo'
GROUP BY c.id, c.nome, c.email, c.pin_atual, c.pin_nivel, c.status, c.data_ativacao, c.ultimo_ciclo, w.balance, cp.points_total, cp.points_trimestre_atual;

-- ================================================
-- VIEW 3: vw_vmec_calculation
-- Cálculo de VMEC por consultor
-- ================================================

CREATE OR REPLACE VIEW vw_vmec_calculation AS
WITH linhas_ciclos AS (
    SELECT
        c.id AS consultor_id,
        c.nome,
        c.pin_nivel,
        d.linha,
        COUNT(DISTINCT mc.id) FILTER (WHERE mc.status = 'completed') AS ciclos_linha
    FROM consultores c
    LEFT JOIN downlines d ON d.upline_id = c.id AND d.nivel = 1
    LEFT JOIN consultores dc ON dc.id = d.downline_id
    LEFT JOIN matriz_cycles mc ON mc.consultor_id = dc.id
    GROUP BY c.id, c.nome, c.pin_nivel, d.linha
)
SELECT
    consultor_id,
    nome,
    pin_nivel,
    SUM(ciclos_linha) AS ciclos_totais,
    -- VMEC será calculado na aplicação baseado no PIN
    jsonb_object_agg(
        COALESCE(linha::TEXT, 'sem_linha'), 
        ciclos_linha
    ) AS ciclos_por_linha
FROM linhas_ciclos
GROUP BY consultor_id, nome, pin_nivel;

-- ================================================
-- VIEW 4: vw_top_sigma_ranking
-- Ranking para o pool Top SIGMA
-- ================================================

CREATE OR REPLACE VIEW vw_top_sigma_ranking AS
WITH ciclos_mes AS (
    SELECT
        mc.consultor_id,
        COUNT(*) AS ciclos_completos,
        SUM(mc.cycle_value_total) AS volume_total
    FROM matriz_cycles mc
    WHERE 
        mc.status = 'completed'
        AND EXTRACT(MONTH FROM mc.completed_at) = EXTRACT(MONTH FROM NOW())
        AND EXTRACT(YEAR FROM mc.completed_at) = EXTRACT(YEAR FROM NOW())
    GROUP BY mc.consultor_id
)
SELECT
    ROW_NUMBER() OVER (ORDER BY cm.ciclos_completos DESC, cm.volume_total DESC) AS posicao,
    c.id AS consultor_id,
    c.nome,
    c.pin_atual,
    cm.ciclos_completos,
    cm.volume_total,
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY cm.ciclos_completos DESC) <= 10 THEN true
        ELSE false
    END AS elegivel_top_sigma
FROM ciclos_mes cm
JOIN consultores c ON c.id = cm.consultor_id
WHERE c.status = 'ativo'
ORDER BY posicao
LIMIT 20;

-- ================================================
-- TRIGGER 1: on_sale_insert
-- Dispara automaticamente ao registrar venda
-- ================================================

CREATE OR REPLACE FUNCTION trg_process_sale()
RETURNS TRIGGER AS $$
DECLARE
    v_cycle_id UUID;
    v_slots_filled INTEGER;
BEGIN
    -- Buscar ou criar ciclo aberto
    SELECT id, slots_filled INTO v_cycle_id, v_slots_filled
    FROM matriz_cycles
    WHERE consultor_id = NEW.buyer_id AND status = 'open'
    ORDER BY opened_at DESC
    LIMIT 1;

    -- Se não existe ciclo aberto, criar novo
    IF v_cycle_id IS NULL THEN
        INSERT INTO matriz_cycles (consultor_id, cycle_number, status)
        SELECT NEW.buyer_id, COALESCE(MAX(cycle_number), 0) + 1, 'open'
        FROM matriz_cycles
        WHERE consultor_id = NEW.buyer_id
        RETURNING id, slots_filled INTO v_cycle_id, v_slots_filled;
    END IF;

    -- Atualizar venda com cycle_id
    NEW.matrix_id := v_cycle_id;
    NEW.matrix_slot_filled := v_slots_filled + 1;

    -- Atualizar contador do ciclo
    UPDATE matriz_cycles
    SET slots_filled = slots_filled + 1,
        updated_at = NOW()
    WHERE id = v_cycle_id;

    -- Verificar se completou
    IF (v_slots_filled + 1) = 6 THEN
        UPDATE matriz_cycles
        SET status = 'completed',
            completed_at = NOW()
        WHERE id = v_cycle_id;

        -- Registrar evento
        INSERT INTO cycle_events (cycle_id, consultor_id, event_type, event_data)
        VALUES (v_cycle_id, NEW.buyer_id, 'cycle_completed', jsonb_build_object(
            'payout', 108.00,
            'sale_id', NEW.id
        ));
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_on_sale_insert
BEFORE INSERT ON sales
FOR EACH ROW
WHEN (NEW.contributes_to_matrix = true AND NEW.payment_status = 'completed')
EXECUTE FUNCTION trg_process_sale();

-- ================================================
-- TRIGGER 2: on_cycle_completed
-- Executa ações ao completar ciclo
-- ================================================

CREATE OR REPLACE FUNCTION trg_on_cycle_completed()
RETURNS TRIGGER AS $$
BEGIN
    -- Só executa se mudou para completed
    IF NEW.status = 'completed' AND OLD.status = 'open' THEN
        
        -- 1. Atribuir ponto de carreira
        INSERT INTO career_points (consultor_id, points_total, points_trimestre_atual, total_cycles_completed)
        VALUES (NEW.consultor_id, 1, 1, 1)
        ON CONFLICT (consultor_id) DO UPDATE
        SET points_total = career_points.points_total + 1,
            points_trimestre_atual = career_points.points_trimestre_atual + 1,
            total_cycles_completed = career_points.total_cycles_completed + 1,
            last_cycle_date = NOW();

        -- 2. Atualizar consultor
        UPDATE consultores
        SET total_ciclos = total_ciclos + 1,
            ultimo_ciclo = NOW(),
            ciclos_acumulados_trimestre = ciclos_acumulados_trimestre + 1
        WHERE id = NEW.consultor_id;

        -- 3. Marcar ponto no ciclo
        NEW.career_point_awarded := true;
        NEW.career_point_date := NOW();

        -- 4. Registrar log
        INSERT INTO logs_operations (evento, tipo, consultor_id, payload)
        VALUES (
            'cycle_completed',
            'info',
            NEW.consultor_id,
            jsonb_build_object(
                'cycle_id', NEW.id,
                'cycle_number', NEW.cycle_number,
                'payout', NEW.cycle_payout
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_on_cycle_completed
BEFORE UPDATE ON matriz_cycles
FOR EACH ROW
EXECUTE FUNCTION trg_on_cycle_completed();

-- ================================================
-- TRIGGER 3: on_wallet_update
-- Registra transação ao atualizar carteira
-- ================================================

CREATE OR REPLACE FUNCTION trg_log_wallet_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Só registra se balance mudou
    IF NEW.balance != OLD.balance THEN
        INSERT INTO transactions (
            wallet_id,
            consultor_id,
            tipo,
            valor,
            balance_before,
            balance_after,
            status,
            descricao
        ) VALUES (
            NEW.id,
            NEW.consultor_id,
            CASE 
                WHEN NEW.balance > OLD.balance THEN 'credito'
                ELSE 'debito'
            END,
            ABS(NEW.balance - OLD.balance),
            OLD.balance,
            NEW.balance,
            'completed',
            'Atualização automática de saldo'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_on_wallet_update
AFTER UPDATE ON wallets
FOR EACH ROW
EXECUTE FUNCTION trg_log_wallet_transaction();

-- ================================================
-- FUNÇÃO AUXILIAR: get_uplines
-- Busca uplines até nível N
-- ================================================

CREATE OR REPLACE FUNCTION get_uplines(
    p_consultor_id UUID,
    p_max_nivel INTEGER DEFAULT 6
)
RETURNS TABLE (
    upline_id UUID,
    nivel INTEGER,
    nome VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE upline_tree AS (
        -- Caso base: patrocinador direto
        SELECT 
            c.patrocinador_id AS upline_id,
            1 AS nivel
        FROM consultores c
        WHERE c.id = p_consultor_id
        AND c.patrocinador_id IS NOT NULL

        UNION ALL

        -- Caso recursivo: subir níveis
        SELECT 
            c.patrocinador_id,
            ut.nivel + 1
        FROM upline_tree ut
        JOIN consultores c ON c.id = ut.upline_id
        WHERE c.patrocinador_id IS NOT NULL
        AND ut.nivel < p_max_nivel
    )
    SELECT 
        ut.upline_id,
        ut.nivel,
        c.nome
    FROM upline_tree ut
    JOIN consultores c ON c.id = ut.upline_id
    ORDER BY ut.nivel;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ================================================

CREATE INDEX IF NOT EXISTS idx_sales_payment_completed 
ON sales(payment_status) WHERE payment_status = 'completed';

CREATE INDEX IF NOT EXISTS idx_cycles_completed_date 
ON matriz_cycles(completed_at) WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS idx_bonuses_pendente 
ON bonuses(status, consultor_id) WHERE status = 'pendente';

CREATE INDEX IF NOT EXISTS idx_consultores_ativo 
ON consultores(status) WHERE status = 'ativo';

-- ================================================
-- COMENTÁRIOS NAS TABELAS
-- ================================================

COMMENT ON VIEW vw_active_cycles IS 'Visão geral de todos os ciclos ativos no sistema';
COMMENT ON VIEW vw_consultor_performance IS 'Performance completa do consultor incluindo vendas, bônus e rede';
COMMENT ON VIEW vw_vmec_calculation IS 'Cálculo de ciclos por linha para aplicação do VMEC';
COMMENT ON VIEW vw_top_sigma_ranking IS 'Ranking mensal para distribuição do pool Top SIGMA';

COMMENT ON FUNCTION trg_process_sale() IS 'Processa venda automaticamente e atualiza ciclo';
COMMENT ON FUNCTION trg_on_cycle_completed() IS 'Executa ações ao completar um ciclo (ponto, log, etc)';
COMMENT ON FUNCTION get_uplines(UUID, INTEGER) IS 'Retorna uplines até o nível especificado';

-- ================================================
-- FIM
-- ================================================

-- Verificar views criadas:
SELECT table_name, view_definition 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name LIKE 'vw_%';
