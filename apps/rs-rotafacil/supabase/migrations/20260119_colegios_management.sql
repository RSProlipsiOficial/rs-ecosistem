-- Migration: Gerenciamento de Colégios por Van
-- Criado em: 2026-01-19

-- Tabela: colegios
CREATE TABLE IF NOT EXISTS colegios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, nome)
);

-- Tabela: van_colegios (Many-to-Many)
CREATE TABLE IF NOT EXISTS van_colegios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  van_id UUID NOT NULL REFERENCES vans(id) ON DELETE CASCADE,
  colegio_id UUID NOT NULL REFERENCES colegios(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(van_id, colegio_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_coleg ios_user_id ON colegios(user_id);
CREATE INDEX IF NOT EXISTS idx_colegios_ativo ON colegios(ativo);
CREATE INDEX IF NOT EXISTS idx_van_colegios_van_id ON van_colegios(van_id);
CREATE INDEX IF NOT EXISTS idx_van_colegios_colegio_id ON van_colegios(colegio_id);

-- RLS Policies para colegios
ALTER TABLE colegios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own colegios"
  ON colegios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own colegios"
  ON colegios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own colegios"
  ON colegios FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own colegios"
  ON colegios FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies para van_colegios
ALTER TABLE van_colegios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their van_colegios"
  ON van_colegios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vans
      WHERE vans.id = van_colegios.van_id
      AND vans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their van_colegios"
  ON van_colegios FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vans
      WHERE vans.id = van_colegios.van_id
      AND vans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their van_colegios"
  ON van_colegios FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM vans
      WHERE vans.id = van_colegios.van_id
      AND vans.user_id = auth.uid()
    )
  );

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_colegios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER trigger_update_colegios_updated_at
  BEFORE UPDATE ON colegios
  FOR EACH ROW
  EXECUTE FUNCTION update_colegios_updated_at();
