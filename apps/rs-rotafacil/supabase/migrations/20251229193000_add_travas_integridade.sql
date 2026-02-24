-- Migração: Travas de Integridade Financeira
-- Criado em: 2025-12-29
-- Objetivo: Adicionar constraints, auditoria e fechamento de competências

-- =====================================================
-- 1. IDEMPOTÊNCIA - Constraints Únicos
-- =====================================================

-- Constraint única para mensalidades (previne duplicação)
ALTER TABLE pagamentos_mensais
DROP CONSTRAINT IF EXISTS unique_mensalidade_aluno_competencia;

ALTER TABLE pagamentos_mensais
ADD CONSTRAINT unique_mensalidade_aluno_competencia 
UNIQUE (aluno_id, mes, ano);

-- Index parcial único para lançamentos (previne duplicação de origem/referência)
DROP INDEX IF EXISTS idx_lancamento_origem_ref;

CREATE UNIQUE INDEX idx_lancamento_origem_ref
ON lancamentos_financeiros(origem, referencia_id)
WHERE origem IN ('mensalidade', 'ajuste') AND referencia_id IS NOT NULL;

-- =====================================================
-- 2. AUDITORIA - Campos de Rastreamento
-- =====================================================

-- Adicionar campos de auditoria
ALTER TABLE lancamentos_financeiros
ADD COLUMN IF NOT EXISTS pago_em TIMESTAMP,
ADD COLUMN IF NOT EXISTS metodo_pagamento TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Adicionar mesmos campos em pagamentos_mensais
ALTER TABLE pagamentos_mensais
ADD COLUMN IF NOT EXISTS pago_em TIMESTAMP,
ADD COLUMN IF NOT EXISTS metodo_pagamento TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em lancamentos_financeiros
DROP TRIGGER IF EXISTS update_lancamentos_updated_at ON lancamentos_financeiros;
CREATE TRIGGER update_lancamentos_updated_at 
BEFORE UPDATE ON lancamentos_financeiros
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Aplicar trigger em pagamentos_mensais
DROP TRIGGER IF EXISTS update_pagamentos_updated_at ON pagamentos_mensais;
CREATE TRIGGER update_pagamentos_updated_at 
BEFORE UPDATE ON pagamentos_mensais
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. FECHAMENTO DE COMPETÊNCIA
-- =====================================================

-- Tabela para controlar competências fechadas
CREATE TABLE IF NOT EXISTS competencias_fechadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competencia TEXT NOT NULL, -- YYYY-MM
  user_id UUID NOT NULL REFERENCES auth.users(id),
  fechado_em TIMESTAMP DEFAULT NOW(),
  motivo TEXT,
  CONSTRAINT unique_competencia_user UNIQUE(competencia, user_id)
);

-- Index para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_competencias_fechadas_competencia
ON competencias_fechadas(competencia);

-- RLS (Row Level Security)
ALTER TABLE competencias_fechadas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas competências fechadas"
ON competencias_fechadas FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem fechar suas competências"
ON competencias_fechadas FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem reabrir suas competências"
ON competencias_fechadas FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 4. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON CONSTRAINT unique_mensalidade_aluno_competencia ON pagamentos_mensais 
IS 'Previne duplicação de mensalidades para o mesmo aluno no mesmo mês/ano';

COMMENT ON INDEX idx_lancamento_origem_ref 
IS 'Previne duplicação de lançamentos com mesma origem e referência';

COMMENT ON COLUMN lancamentos_financeiros.pago_em 
IS 'Data e hora em que o pagamento foi registrado';

COMMENT ON COLUMN lancamentos_financeiros.metodo_pagamento 
IS 'Método utilizado: PIX, Dinheiro, Cartão, Transferência, etc.';

COMMENT ON TABLE competencias_fechadas 
IS 'Controla quais competências (meses) foram fechadas para evitar edições indevidas';
