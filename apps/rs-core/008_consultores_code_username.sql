-- Adiciona campos de ID numérico curto e username para consultores
ALTER TABLE consultores
  ADD COLUMN IF NOT EXISTS codigo_consultor VARCHAR(20) UNIQUE,
  ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_consultores_codigo ON consultores(codigo_consultor);
CREATE INDEX IF NOT EXISTS idx_consultores_username ON consultores(username);

