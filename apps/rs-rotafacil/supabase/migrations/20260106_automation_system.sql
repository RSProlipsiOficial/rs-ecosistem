-- Tabela para armazenar templates de workflows
CREATE TABLE IF NOT EXISTS workflows_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('pix', 'billing', 'festivities')),
  n8n_workflow_id VARCHAR(255),
  workflow_json JSONB NOT NULL,
  required_credentials JSONB DEFAULT '["whatsapp", "bank_api"]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela para log de festiv(idades
CREATE TABLE IF NOT EXISTS festividades_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  tipo_evento VARCHAR(50) NOT NULL CHECK (tipo_evento IN ('aniversario', 'natal', 'ano_novo', 'dia_namorados', 'pascoa', 'outros')),
  mensagem TEXT NOT NULL,
  whatsapp_responsavel VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'enviada' CHECK (status IN ('enviada', 'falhou', 'pendente')),
  enviada_em TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela para instalações de workflows por usuário
CREATE TABLE IF NOT EXISTS workflow_installations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES workflows_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  n8n_workflow_id VARCHAR(255),
  evolution_instance_id VARCHAR(255),
  credentials JSONB, 
  is_active BOOLEAN DEFAULT true,
  last_execution TIMESTAMP,
  installed_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Adicionar campo data_nascimento na tabela alunos se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'alunos' AND column_name = 'data_nascimento'
  ) THEN
    ALTER TABLE alunos ADD COLUMN data_nascimento DATE;
  END IF;
END $$;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_festividades_log_aluno_id ON festividades_log(aluno_id);
CREATE INDEX IF NOT EXISTS idx_festividades_log_tipo_evento ON festividades_log(tipo_evento);
CREATE INDEX IF NOT EXISTS idx_festividades_log_enviada_em ON festividades_log(enviada_em);
CREATE INDEX IF NOT EXISTS idx_workflow_installations_user_id ON workflow_installations(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_installations_template_id ON workflow_installations(template_id);

-- Inserir templates padrão
INSERT INTO workflows_templates (name, description, category, workflow_json, required_credentials)
VALUES 
  (
    'Cobranças Automáticas',
    'Envia lembretes automáticos de pagamento antes, no vencimento e após o vencimento da mensalidade',
    'billing',
    '{}'::jsonb,
    '["whatsapp", "supabase"]'::jsonb
  ),
  (
    'Confirmação PIX Automática',
    'Confirma pagamentos PIX automaticamente e envia recibo por WhatsApp',
    'pix',
    '{}'::jsonb,
    '["whatsapp", "supabase", "bank_api"]'::jsonb
  ),
  (
    'Festividades e Aniversários',
    'Envia mensagens automáticas em datas especiais e aniversários dos alunos',
    'festivities',
    '{}'::jsonb,
    '["whatsapp", "supabase"]'::jsonb
  )
ON CONFLICT DO NOTHING;

-- Comentários nas tabelas
COMMENT ON TABLE workflows_templates IS 'Templates de workflows n8n compartilháveis';
COMMENT ON TABLE festividades_log IS 'Log de mensagens de festividades enviadas';
COMMENT ON TABLE workflow_installations IS 'Instalações de workflows por usuário/cliente';
