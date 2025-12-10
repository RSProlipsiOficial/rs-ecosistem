-- Criar tabelas para o módulo financeiro

-- Tabela para controlar pagamentos mensais dos alunos
CREATE TABLE public.pagamentos_mensais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'nao_pago' CHECK (status IN ('pago', 'nao_pago', 'em_aberto')),
  data_pagamento DATE,
  observacoes TEXT,
  user_id UUID DEFAULT '00000000-0000-0000-0000-000000000000',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(aluno_id, mes, ano)
);

-- Tabela para ganhos extras (fretes, excursões, etc.)
CREATE TABLE public.ganhos_extras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  descricao TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'frete' CHECK (tipo IN ('frete', 'excursao', 'ajuda', 'presente', 'outro')),
  data_ganho DATE NOT NULL,
  observacoes TEXT,
  user_id UUID DEFAULT '00000000-0000-0000-0000-000000000000',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para gastos (fixos e variáveis)
CREATE TABLE public.gastos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  descricao TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'variavel' CHECK (tipo IN ('fixo', 'variavel')),
  status TEXT NOT NULL DEFAULT 'nao_pago' CHECK (status IN ('pago', 'nao_pago', 'em_aberto')),
  data_vencimento DATE,
  data_pagamento DATE,
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  observacoes TEXT,
  user_id UUID DEFAULT '00000000-0000-0000-0000-000000000000',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir gastos fixos pré-carregados para o mês atual
INSERT INTO public.gastos (descricao, valor, tipo, mes, ano) VALUES
  ('Combustível', 800.00, 'variavel', EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
  ('Manutenção', 300.00, 'variavel', EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
  ('Lavagem', 120.00, 'fixo', EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
  ('Troca de óleo', 150.00, 'variavel', EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
  ('IPVA/Seguro', 200.00, 'fixo', EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
  ('Aluguel', 800.00, 'fixo', EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
  ('Alimentação', 400.00, 'variavel', EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
  ('Internet', 100.00, 'fixo', EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
  ('Streaming', 50.00, 'fixo', EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
  ('Imprevistos', 300.00, 'variavel', EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER);

-- Criar triggers para updated_at
CREATE TRIGGER update_pagamentos_mensais_updated_at
  BEFORE UPDATE ON public.pagamentos_mensais
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ganhos_extras_updated_at
  BEFORE UPDATE ON public.ganhos_extras
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gastos_updated_at
  BEFORE UPDATE ON public.gastos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();