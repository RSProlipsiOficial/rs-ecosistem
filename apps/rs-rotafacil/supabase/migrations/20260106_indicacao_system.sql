-- Criar tabela de indicados (separada de alunos)
CREATE TABLE IF NOT EXISTS indicados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Dados pessoais
  nome_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  telefone VARCHAR(20),
  whatsapp VARCHAR(20),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  
  -- Dados de indicação
  indicado_por_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  indicado_por_nome VARCHAR(255),
  codigo_indicacao VARCHAR(50),
  
  -- Meta informações
  origem VARCHAR(50) DEFAULT 'site', -- site, whatsapp, email, telefone
  status VARCHAR(20) DEFAULT 'novo', -- novo, contatado, convertido, perdido
  observacoes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  contatado_em TIMESTAMP,
  convertido_em TIMESTAMP,
  
  -- Conversão para aluno
  convertido_para_aluno_id UUID REFERENCES alunos(id) ON DELETE SET NULL,
  
  -- Controle
  ativo BOOLEAN DEFAULT true
);

-- Adicionar campo codigo_indicacao na tabela users (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'codigo_indicacao'
  ) THEN
    ALTER TABLE users ADD COLUMN codigo_indicacao VARCHAR(50) UNIQUE;
    
    -- Gerar códigos para usuários existentes
    UPDATE users 
    SET codigo_indicacao = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
    WHERE codigo_indicacao IS NULL;
  END IF;
END $$;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_indicados_email ON indicados(email);
CREATE INDEX IF NOT EXISTS idx_indicados_indicado_por ON indicados(indicado_por_id);
CREATE INDEX IF NOT EXISTS idx_indicados_codigo ON indicados(codigo_indicacao);
CREATE INDEX IF NOT EXISTS idx_indicados_status ON indicados(status);
CREATE INDEX IF NOT EXISTS idx_indicados_ativo ON indicados(ativo);
CREATE INDEX IF NOT EXISTS idx_users_codigo_indicacao ON users(codigo_indicacao);

-- Habilitar RLS
ALTER TABLE indicados ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer um pode inserir (cadastro público)
CREATE POLICY "Anyone can insert indicados"
  ON indicados FOR INSERT
  WITH CHECK (true);

-- Política: Usuários veem apenas seus indicados
CREATE POLICY "Users can view their own indicados"
  ON indicados FOR SELECT
  USING (
    auth.uid() = indicado_por_id 
    OR 
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type IN ('admin', 'super_admin')
    )
  );

-- Política: Usuários podem atualizar seus indicados
CREATE POLICY "Users can update their own indicados"
  ON indicados FOR UPDATE
  USING (
    auth.uid() = indicado_por_id
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type IN ('admin', 'super_admin')
    )
  );

-- Função para auto-atualizar updated_at
CREATE OR REPLACE FUNCTION update_indicados_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_indicados_updated_at ON indicados;
CREATE TRIGGER trigger_update_indicados_updated_at
  BEFORE UPDATE ON indicados
  FOR EACH ROW
  EXECUTE FUNCTION update_indicados_updated_at();

-- View para estatísticas de indicação
CREATE OR REPLACE VIEW indicados_stats AS
SELECT 
  u.id as user_id,
  u.name as user_name,
  u.codigo_indicacao,
  COUNT(i.id) as total_indicados,
  COUNT(CASE WHEN i.status = 'novo' THEN 1 END) as novos,
  COUNT(CASE WHEN i.status = 'contatado' THEN 1 END) as contatados,
  COUNT(CASE WHEN i.status = 'convertido' THEN 1 END) as convertidos,
  COUNT(CASE WHEN i.status = 'perdido' THEN 1 END) as perdidos
FROM users u
LEFT JOIN indicados i ON i.indicado_por_id = u.id
WHERE u.ativo = true
GROUP BY u.id, u.name, u.codigo_indicacao;

-- Comentários
COMMENT ON TABLE indicados IS 'Tabela de leads/indicados - separada de alunos';
COMMENT ON COLUMN indicados.status IS 'novo, contatado, convertido, perdido';
COMMENT ON COLUMN indicados.origem IS 'site, whatsapp, email, telefone';
COMMENT ON COLUMN users.codigo_indicacao IS 'Código único de indicação do usuário';
