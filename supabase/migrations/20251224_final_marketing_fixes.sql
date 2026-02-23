-- ================================================
-- RS PRÓLIPSI - FINAL MARKETING FIXES
-- Funções auxiliares para bônus e carreira
-- ================================================

-- 1. FUNÇÃO: get_team_ids
-- Retorna todos os IDs da equipe abaixo de um consultor (recursivo)
CREATE OR REPLACE FUNCTION get_team_ids(p_root_id UUID)
RETURNS TABLE (consultor_id UUID) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE team_tree AS (
        -- Caso base: os diretos do root
        SELECT c.id
        FROM consultores c
        WHERE c.patrocinador_id = p_root_id

        UNION ALL

        -- Caso recursivo: descer na equipe
        SELECT c.id
        FROM team_tree tt
        JOIN consultores c ON c.patrocinador_id = tt.id
    )
    SELECT id FROM team_tree;
END;
$$ LANGUAGE plpgsql;

-- 2. FUNÇÃO: get_uplines_recursive
-- Retorna uplines até o nível especificado com compressão dinâmica (status = 'ativo')
CREATE OR REPLACE FUNCTION get_uplines_recursive(
    p_consultor_id UUID,
    p_max_levels INTEGER DEFAULT 6
)
RETURNS TABLE (upline_id UUID, nivel INTEGER, status VARCHAR) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE upline_tree AS (
        -- Caso base: buscar patrocinador do consultor
        SELECT 
            c.patrocinador_id,
            CASE WHEN c.status = 'ativo' THEN 1 ELSE 0 END as nivel_incremento,
            c.status as current_status
        FROM consultores c
        WHERE c.id = p_consultor_id
        AND c.patrocinador_id IS NOT NULL

        UNION ALL

        -- Caso recursivo: subir na árvore
        SELECT 
            c.patrocinador_id,
            CASE WHEN c.status = 'ativo' THEN ut.nivel_incremento + 1 ELSE ut.nivel_incremento END,
            c.status
        FROM upline_tree ut
        JOIN consultores c ON c.id = ut.patrocinador_id
        WHERE c.patrocinador_id IS NOT NULL
        AND ut.nivel_incremento < p_max_levels
    )
    SELECT 
        ut.patrocinador_id,
        ut.nivel_incremento,
        ut.current_status
    FROM upline_tree ut
    WHERE ut.nivel_incremento > 0;
END;
$$ LANGUAGE plpgsql;

-- 3. PADRONIZAÇÃO DE TABELAS (Garantir colunas necessárias)
DO $$ 
BEGIN 
    -- Garantir coluna matrix_accumulated em orders (usado pelo sigmaEligibility.ts)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'matrix_accumulated') THEN
        ALTER TABLE orders ADD COLUMN matrix_accumulated DECIMAL(10, 2) DEFAULT 0.00;
    END IF;

    -- Garantir colunas em matriz_cycles para os slots
    FOR i IN 1..6 LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matriz_cycles' AND column_name = 'slot_' || i || '_sale_id') THEN
            EXECUTE 'ALTER TABLE matriz_cycles ADD COLUMN slot_' || i || '_sale_id UUID REFERENCES sales(id)';
        END IF;
    END LOOP;
END $$;

COMMENT ON FUNCTION get_team_ids(UUID) IS 'Retorna recursivamente todos os IDs da equipe de um consultor.';
COMMENT ON FUNCTION get_uplines_recursive(UUID, INTEGER) IS 'Retorna recursivamente os uplines ativos (compressão dinâmica).';
