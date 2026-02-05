-- Migração: Adicionar Categorização de Gastos
-- Criado em: 2025-12-29
-- Objetivo: Adicionar sistema de categorias para despesas

-- 1. Adicionar campos de categoria e subcategoria
ALTER TABLE lancamentos_financeiros 
ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'OUTROS',
ADD COLUMN IF NOT EXISTS subcategoria TEXT;

-- 2. Criar constraint para validar categorias permitidas
ALTER TABLE lancamentos_financeiros 
DROP CONSTRAINT IF EXISTS check_categoria;

ALTER TABLE lancamentos_financeiros 
ADD CONSTRAINT check_categoria CHECK (
  categoria IN (
    'FIXO', 
    'VARIAVEL', 
    'COMBUSTIVEL', 
    'MANUTENCAO', 
    'PNEUS', 
    'MULTAS', 
    'IMPOSTOS', 
    'SALARIOS_DIARIAS', 
    'TERCEIROS', 
    'ADMIN', 
    'OUTROS'
  )
);

-- 3. Criar índice para melhorar performance de queries por categoria
CREATE INDEX IF NOT EXISTS idx_lancamentos_categoria 
ON lancamentos_financeiros(categoria) 
WHERE tipo = 'despesa';

-- 4. Atualizar registros existentes baseado em padrões comuns
-- (Opcional: pode ser comentado se preferir categorizar manualmente)
UPDATE lancamentos_financeiros 
SET categoria = CASE
  WHEN LOWER(descricao) LIKE '%combustível%' OR LOWER(descricao) LIKE '%gasolina%' OR LOWER(descricao) LIKE '%diesel%' THEN 'COMBUSTIVEL'
  WHEN LOWER(descricao) LIKE '%manutenção%' OR LOWER(descricao) LIKE '%oficina%' OR LOWER(descricao) LIKE '%reparo%' THEN 'MANUTENCAO'
  WHEN LOWER(descricao) LIKE '%pneu%' THEN 'PNEUS'
  WHEN LOWER(descricao) LIKE '%multa%' THEN 'MULTAS'
  WHEN LOWER(descricao) LIKE '%imposto%' OR LOWER(descricao) LIKE '%ipva%' OR LOWER(descricao) LIKE '%licenciamento%' THEN 'IMPOSTOS'
  WHEN LOWER(descricao) LIKE '%salário%' OR LOWER(descricao) LIKE '%diária%' OR LOWER(descricao) LIKE '%motorista%' THEN 'SALARIOS_DIARIAS'
  WHEN alocacao = 'dono' THEN 'FIXO'
  ELSE 'OUTROS'
END
WHERE tipo = 'despesa' AND categoria = 'OUTROS';

-- 5. Comentários para documentação
COMMENT ON COLUMN lancamentos_financeiros.categoria IS 'Categoria da despesa: FIXO, VARIAVEL, COMBUSTIVEL, MANUTENCAO, PNEUS, MULTAS, IMPOSTOS, SALARIOS_DIARIAS, TERCEIROS, ADMIN, OUTROS';
COMMENT ON COLUMN lancamentos_financeiros.subcategoria IS 'Subcategoria opcional para detalhamento adicional da despesa';
