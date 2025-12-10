-- ================================================
-- RS PRÓLIPSI - TABELAS DE CARREIRA E VMEC
-- Sistema trimestral com 13 PINs e VMEC
-- ================================================

-- ================================================
-- 1. PONTOS DE CARREIRA POR CICLO
-- ================================================

CREATE TABLE IF NOT EXISTS career_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES consultores(id) ON DELETE CASCADE,
  quarter_id TEXT NOT NULL,           -- "2025-Q1", "2025-Q2", etc.
  line_id INT NOT NULL,               -- 1, 2, 3, ... (linha direta)
  cycle_id UUID REFERENCES matriz_cycles(id),
  raw_points NUMERIC NOT NULL DEFAULT 1,  -- pontos antes do VMEC (sempre 1 por ciclo)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Índices
  CONSTRAINT unique_cycle_point UNIQUE (cycle_id)
);

CREATE INDEX idx_career_points_user_quarter ON career_points(user_id, quarter_id);
CREATE INDEX idx_career_points_line ON career_points(line_id);
CREATE INDEX idx_career_points_created ON career_points(created_at);

COMMENT ON TABLE career_points IS 'Pontos de carreira gerados por ciclos completados. 1 ponto por ciclo.';
COMMENT ON COLUMN career_points.quarter_id IS 'Trimestre no formato YYYY-Q1, YYYY-Q2, etc.';
COMMENT ON COLUMN career_points.line_id IS 'Número da linha direta (1-N). Usado para aplicar VMEC.';
COMMENT ON COLUMN career_points.raw_points IS 'Pontos brutos antes da aplicação do VMEC. Sempre 1 por ciclo.';

-- ================================================
-- 2. VMEC APLICADO POR TRIMESTRE
-- ================================================

CREATE TABLE IF NOT EXISTS career_vmec_applied (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES consultores(id) ON DELETE CASCADE,
  quarter_id TEXT NOT NULL,
  pin_code TEXT NOT NULL,             -- PIN01, PIN02, etc.
  pin_label TEXT NOT NULL,            -- Bronze, Prata, etc.
  
  -- Configuração VMEC usada
  vmec_percentages JSONB NOT NULL,    -- [60, 40] ou [50, 30, 20], etc.
  lines_required INT NOT NULL,
  
  -- Breakdown por linha
  line_breakdown JSONB NOT NULL,      -- { "L1": { "raw": 100, "capped": 90 }, "L2": { "raw": 50, "capped": 50 } }
  
  -- Totais
  total_raw_points NUMERIC NOT NULL,
  total_capped_points NUMERIC NOT NULL,  -- depois do VMEC
  eligible_points NUMERIC NOT NULL,      -- pontos elegíveis finais
  
  -- Qualificação
  qualifies BOOLEAN NOT NULL DEFAULT false,
  reasons JSONB,                      -- motivos se não qualificar
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Índices
  CONSTRAINT unique_user_quarter_vmec UNIQUE (user_id, quarter_id)
);

CREATE INDEX idx_vmec_user_quarter ON career_vmec_applied(user_id, quarter_id);
CREATE INDEX idx_vmec_pin ON career_vmec_applied(pin_code);
CREATE INDEX idx_vmec_qualifies ON career_vmec_applied(qualifies);

COMMENT ON TABLE career_vmec_applied IS 'VMEC aplicado por consultor e trimestre. Armazena breakdown completo para auditoria.';
COMMENT ON COLUMN career_vmec_applied.line_breakdown IS 'Detalhamento de pontos por linha antes e depois do cap.';
COMMENT ON COLUMN career_vmec_applied.eligible_points IS 'Pontos finais elegíveis após aplicação de todos os caps VMEC.';

-- ================================================
-- 3. HISTÓRICO DE RANK/PIN
-- ================================================

CREATE TABLE IF NOT EXISTS career_rank_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES consultores(id) ON DELETE CASCADE,
  quarter_id TEXT NOT NULL,
  
  -- PIN anterior e novo
  previous_pin_code TEXT,
  previous_pin_label TEXT,
  new_pin_code TEXT NOT NULL,
  new_pin_label TEXT NOT NULL,
  
  -- Pontos
  eligible_points NUMERIC NOT NULL,
  required_points NUMERIC NOT NULL,
  
  -- Ação
  action TEXT NOT NULL,               -- 'promoted', 'maintained', 'downgraded'
  promoted BOOLEAN NOT NULL DEFAULT false,
  
  -- Recompensa
  reward_amount NUMERIC DEFAULT 0,
  reward_paid BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Índices
  CONSTRAINT check_action CHECK (action IN ('promoted', 'maintained', 'downgraded'))
);

CREATE INDEX idx_rank_history_user ON career_rank_history(user_id);
CREATE INDEX idx_rank_history_quarter ON career_rank_history(quarter_id);
CREATE INDEX idx_rank_history_action ON career_rank_history(action);
CREATE INDEX idx_rank_history_promoted ON career_rank_history(promoted);

COMMENT ON TABLE career_rank_history IS 'Histórico de mudanças de PIN por trimestre.';
COMMENT ON COLUMN career_rank_history.action IS 'Tipo de mudança: promoted (subiu), maintained (manteve), downgraded (desceu)';

-- ================================================
-- 4. SNAPSHOTS TRIMESTRAIS
-- ================================================

CREATE TABLE IF NOT EXISTS career_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES consultores(id) ON DELETE CASCADE,
  quarter_id TEXT NOT NULL,
  snapshot_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Estado do consultor
  pin_code TEXT NOT NULL,
  pin_label TEXT NOT NULL,
  
  -- Pontos
  total_raw_points NUMERIC NOT NULL,
  total_eligible_points NUMERIC NOT NULL,
  
  -- Linhas
  active_directs INT NOT NULL,
  lines_contributing INT NOT NULL,
  
  -- VMEC breakdown
  vmec_breakdown JSONB NOT NULL,
  
  -- Elegibilidade
  is_active BOOLEAN NOT NULL,
  has_kyc BOOLEAN NOT NULL,
  has_personal_purchase BOOLEAN NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Índices
  CONSTRAINT unique_user_quarter_snapshot UNIQUE (user_id, quarter_id)
);

CREATE INDEX idx_snapshots_user ON career_snapshots(user_id);
CREATE INDEX idx_snapshots_quarter ON career_snapshots(quarter_id);
CREATE INDEX idx_snapshots_pin ON career_snapshots(pin_code);
CREATE INDEX idx_snapshots_date ON career_snapshots(snapshot_date);

COMMENT ON TABLE career_snapshots IS 'Snapshot do estado de carreira ao final de cada trimestre. Usado para auditoria e histórico.';

-- ================================================
-- 5. FUNÇÃO: CALCULAR VMEC
-- ================================================

CREATE OR REPLACE FUNCTION calculate_vmec_for_user(
  p_user_id UUID,
  p_quarter_id TEXT,
  p_pin_code TEXT
) RETURNS TABLE (
  total_raw NUMERIC,
  total_capped NUMERIC,
  eligible NUMERIC,
  breakdown JSONB,
  qualifies BOOLEAN
) AS $$
DECLARE
  v_vmec_percentages NUMERIC[];
  v_lines_required INT;
  v_line_points JSONB;
  v_total_raw NUMERIC := 0;
  v_total_capped NUMERIC := 0;
  v_line_id INT;
  v_line_raw NUMERIC;
  v_line_cap NUMERIC;
  v_line_capped NUMERIC;
  v_breakdown JSONB := '{}';
BEGIN
  -- Configuração VMEC por PIN (conforme rs-config/src/settings/carreira.json)
  
  -- PIN01 - Bronze: sem VMEC
  IF p_pin_code = 'PIN01' THEN
    v_vmec_percentages := ARRAY[]::NUMERIC[];
    v_lines_required := 0;
  
  -- PIN02 - Prata: [100%]
  ELSIF p_pin_code = 'PIN02' THEN
    v_vmec_percentages := ARRAY[100];
    v_lines_required := 1;
  
  -- PIN03 - Ouro: [100%]
  ELSIF p_pin_code = 'PIN03' THEN
    v_vmec_percentages := ARRAY[100];
    v_lines_required := 1;
  
  -- PIN04 - Safira: [60%, 40%]
  ELSIF p_pin_code = 'PIN04' THEN
    v_vmec_percentages := ARRAY[60, 40];
    v_lines_required := 2;
  
  -- PIN05 - Esmeralda: [60%, 40%]
  ELSIF p_pin_code = 'PIN05' THEN
    v_vmec_percentages := ARRAY[60, 40];
    v_lines_required := 2;
  
  -- PIN06 - Topázio: [60%, 40%]
  ELSIF p_pin_code = 'PIN06' THEN
    v_vmec_percentages := ARRAY[60, 40];
    v_lines_required := 2;
  
  -- PIN07 - Rubi: [50%, 30%, 20%]
  ELSIF p_pin_code = 'PIN07' THEN
    v_vmec_percentages := ARRAY[50, 30, 20];
    v_lines_required := 3;
  
  -- PIN08 - Diamante: [50%, 30%, 20%]
  ELSIF p_pin_code = 'PIN08' THEN
    v_vmec_percentages := ARRAY[50, 30, 20];
    v_lines_required := 3;
  
  -- PIN09 - Duplo Diamante: [40%, 30%, 20%, 10%]
  ELSIF p_pin_code = 'PIN09' THEN
    v_vmec_percentages := ARRAY[40, 30, 20, 10];
    v_lines_required := 4;
  
  -- PIN10 - Triplo Diamante: [35%, 25%, 20%, 10%, 10%]
  ELSIF p_pin_code = 'PIN10' THEN
    v_vmec_percentages := ARRAY[35, 25, 20, 10, 10];
    v_lines_required := 5;
  
  -- PIN11 - Diamante Red: [30%, 20%, 18%, 12%, 10%, 10%]
  ELSIF p_pin_code = 'PIN11' THEN
    v_vmec_percentages := ARRAY[30, 20, 18, 12, 10, 10];
    v_lines_required := 6;
  
  -- PIN12 - Diamante Blue: [30%, 20%, 18%, 12%, 10%, 10%]
  ELSIF p_pin_code = 'PIN12' THEN
    v_vmec_percentages := ARRAY[30, 20, 18, 12, 10, 10];
    v_lines_required := 6;
  
  -- PIN13 - Diamante Black: [30%, 20%, 18%, 12%, 10%, 10%]
  ELSIF p_pin_code = 'PIN13' THEN
    v_vmec_percentages := ARRAY[30, 20, 18, 12, 10, 10];
    v_lines_required := 6;
  
  -- Fallback: PIN desconhecido
  ELSE
    v_vmec_percentages := ARRAY[100];
    v_lines_required := 1;
  END IF;
  
  -- Agrupar pontos por linha
  SELECT jsonb_object_agg(line_id::TEXT, SUM(raw_points))
  INTO v_line_points
  FROM career_points
  WHERE user_id = p_user_id
    AND quarter_id = p_quarter_id
  GROUP BY line_id;
  
  -- Calcular total bruto
  SELECT SUM(raw_points)
  INTO v_total_raw
  FROM career_points
  WHERE user_id = p_user_id
    AND quarter_id = p_quarter_id;
  
  v_total_raw := COALESCE(v_total_raw, 0);
  
  -- Aplicar VMEC por linha
  FOR v_line_id IN 1..10 LOOP  -- Máximo 10 linhas
    v_line_raw := COALESCE((v_line_points->>v_line_id::TEXT)::NUMERIC, 0);
    
    IF v_line_raw > 0 THEN
      -- Calcular cap desta linha
      IF v_line_id <= array_length(v_vmec_percentages, 1) THEN
        v_line_cap := v_total_raw * (v_vmec_percentages[v_line_id] / 100.0);
      ELSE
        v_line_cap := v_total_raw * 0.10;  -- Default 10% para linhas extras
      END IF;
      
      -- Aplicar cap
      v_line_capped := LEAST(v_line_raw, v_line_cap);
      v_total_capped := v_total_capped + v_line_capped;
      
      -- Adicionar ao breakdown
      v_breakdown := v_breakdown || jsonb_build_object(
        'L' || v_line_id,
        jsonb_build_object(
          'raw', v_line_raw,
          'cap', v_line_cap,
          'capped', v_line_capped
        )
      );
    END IF;
  END LOOP;
  
  -- Retornar resultado
  RETURN QUERY SELECT
    v_total_raw,
    v_total_capped,
    v_total_capped,  -- eligible = capped (por ora)
    v_breakdown,
    true;  -- qualifies (simplificado)
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_vmec_for_user IS 'Calcula VMEC para um consultor em um trimestre específico. Retorna pontos brutos, cappados e breakdown por linha.';

-- ================================================
-- 6. TRIGGER: CRIAR PONTO AO COMPLETAR CICLO
-- ================================================

CREATE OR REPLACE FUNCTION trg_create_career_point()
RETURNS TRIGGER AS $$
DECLARE
  v_quarter_id TEXT;
  v_line_id INT;
BEGIN
  -- Determinar quarter atual
  v_quarter_id := TO_CHAR(NEW.completed_at, 'YYYY') || '-Q' || 
                  EXTRACT(QUARTER FROM NEW.completed_at)::TEXT;
  
  -- Determinar linha (buscar na tabela downlines)
  SELECT nivel INTO v_line_id
  FROM downlines
  WHERE downline_id = NEW.consultor_id
  LIMIT 1;
  
  v_line_id := COALESCE(v_line_id, 1);
  
  -- Criar ponto de carreira
  INSERT INTO career_points (
    user_id,
    quarter_id,
    line_id,
    cycle_id,
    raw_points
  ) VALUES (
    NEW.consultor_id,
    v_quarter_id,
    v_line_id,
    NEW.id,
    1
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cycle_completed_create_point
AFTER UPDATE ON matriz_cycles
FOR EACH ROW
WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
EXECUTE FUNCTION trg_create_career_point();

COMMENT ON FUNCTION trg_create_career_point IS 'Cria automaticamente 1 ponto de carreira ao completar um ciclo.';

-- ================================================
-- 7. VIEW: PONTOS POR CONSULTOR E TRIMESTRE
-- ================================================

CREATE OR REPLACE VIEW vw_career_points_summary AS
SELECT
  cp.user_id,
  c.nome,
  c.email,
  c.pin_atual,
  cp.quarter_id,
  COUNT(DISTINCT cp.line_id) as lines_contributing,
  SUM(cp.raw_points) as total_raw_points,
  jsonb_object_agg(
    'L' || cp.line_id,
    SUM(cp.raw_points)
  ) as points_by_line
FROM career_points cp
JOIN consultores c ON c.id = cp.user_id
GROUP BY cp.user_id, c.nome, c.email, c.pin_atual, cp.quarter_id
ORDER BY cp.quarter_id DESC, total_raw_points DESC;

COMMENT ON VIEW vw_career_points_summary IS 'Resumo de pontos de carreira por consultor e trimestre.';

-- ================================================
-- FIM
-- ================================================
