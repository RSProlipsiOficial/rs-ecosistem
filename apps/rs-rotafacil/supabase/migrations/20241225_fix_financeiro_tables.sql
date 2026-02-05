
-- Garantir que a extensão uuid-ossp existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABELA ALUNOS
-- ==========================================
-- Cria se não existe (pode estar vazia de colunas se criada via UI sem colunas)
CREATE TABLE IF NOT EXISTS public.alunos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bloco anônimo para adicionar colunas condicionalmente
DO $$
BEGIN
    -- user_id (FK)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'user_id') THEN
        ALTER TABLE public.alunos ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Campos de texto
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'nome_completo') THEN
        ALTER TABLE public.alunos ADD COLUMN nome_completo TEXT NOT NULL DEFAULT 'Aluno';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'nome_responsavel') THEN
        ALTER TABLE public.alunos ADD COLUMN nome_responsavel TEXT NOT NULL DEFAULT 'Responsável';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'whatsapp_responsavel') THEN
        ALTER TABLE public.alunos ADD COLUMN whatsapp_responsavel TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'endereco_rua') THEN
        ALTER TABLE public.alunos ADD COLUMN endereco_rua TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'endereco_numero') THEN
        ALTER TABLE public.alunos ADD COLUMN endereco_numero TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'endereco_bairro') THEN
        ALTER TABLE public.alunos ADD COLUMN endereco_bairro TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'endereco_cidade') THEN
        ALTER TABLE public.alunos ADD COLUMN endereco_cidade TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'endereco_estado') THEN
        ALTER TABLE public.alunos ADD COLUMN endereco_estado TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'endereco_cep') THEN
        ALTER TABLE public.alunos ADD COLUMN endereco_cep TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'tipo_residencia') THEN
        ALTER TABLE public.alunos ADD COLUMN tipo_residencia TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'nome_colegio') THEN
        ALTER TABLE public.alunos ADD COLUMN nome_colegio TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'serie') THEN
        ALTER TABLE public.alunos ADD COLUMN serie TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'turno') THEN
        ALTER TABLE public.alunos ADD COLUMN turno TEXT;
    END IF;
    
    -- Valores numéricos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'valor_mensalidade') THEN
        ALTER TABLE public.alunos ADD COLUMN valor_mensalidade DECIMAL(10, 2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'valor_letalidade') THEN
        ALTER TABLE public.alunos ADD COLUMN valor_letalidade DECIMAL(10, 2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'dia_vencimento') THEN
        ALTER TABLE public.alunos ADD COLUMN dia_vencimento INTEGER;
    END IF;
    
    -- Foreign Keys e Flags
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'van_id') THEN
        ALTER TABLE public.alunos ADD COLUMN van_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'ativo') THEN
        ALTER TABLE public.alunos ADD COLUMN ativo BOOLEAN DEFAULT true;
    END IF;
END $$;

-- RLS Alunos: Remover policies antigas para evitar duplicação ou conflito
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios alunos" ON public.alunos;
CREATE POLICY "Usuários podem ver seus próprios alunos" ON public.alunos FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir seus próprios alunos" ON public.alunos;
CREATE POLICY "Usuários podem inserir seus próprios alunos" ON public.alunos FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios alunos" ON public.alunos;
CREATE POLICY "Usuários podem atualizar seus próprios alunos" ON public.alunos FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar seus próprios alunos" ON public.alunos;
CREATE POLICY "Usuários podem deletar seus próprios alunos" ON public.alunos FOR DELETE USING (auth.uid() = user_id);


-- ==========================================
-- 2. TABELA GASTOS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.gastos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gastos' AND column_name = 'user_id') THEN
        ALTER TABLE public.gastos ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gastos' AND column_name = 'descricao') THEN
        ALTER TABLE public.gastos ADD COLUMN descricao TEXT NOT NULL DEFAULT 'Gasto';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gastos' AND column_name = 'valor') THEN
        ALTER TABLE public.gastos ADD COLUMN valor DECIMAL(10, 2) NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gastos' AND column_name = 'tipo') THEN
        ALTER TABLE public.gastos ADD COLUMN tipo TEXT CHECK (tipo IN ('fixo', 'variavel')) NOT NULL DEFAULT 'variavel';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gastos' AND column_name = 'status') THEN
        ALTER TABLE public.gastos ADD COLUMN status TEXT CHECK (status IN ('pago', 'nao_pago', 'em_aberto')) DEFAULT 'nao_pago';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gastos' AND column_name = 'data_vencimento') THEN
        ALTER TABLE public.gastos ADD COLUMN data_vencimento DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gastos' AND column_name = 'data_pagamento') THEN
        ALTER TABLE public.gastos ADD COLUMN data_pagamento DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gastos' AND column_name = 'mes') THEN
        ALTER TABLE public.gastos ADD COLUMN mes INTEGER NOT NULL DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gastos' AND column_name = 'ano') THEN
        ALTER TABLE public.gastos ADD COLUMN ano INTEGER NOT NULL DEFAULT 2024;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gastos' AND column_name = 'observacoes') THEN
        ALTER TABLE public.gastos ADD COLUMN observacoes TEXT;
    END IF;
END $$;

ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios gastos" ON public.gastos;
CREATE POLICY "Usuários podem ver seus próprios gastos" ON public.gastos FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios gastos" ON public.gastos;
CREATE POLICY "Usuários podem inserir seus próprios gastos" ON public.gastos FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios gastos" ON public.gastos;
CREATE POLICY "Usuários podem atualizar seus próprios gastos" ON public.gastos FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios gastos" ON public.gastos;
CREATE POLICY "Usuários podem deletar seus próprios gastos" ON public.gastos FOR DELETE USING (auth.uid() = user_id);


-- ==========================================
-- 3. TABELA GANHOS EXTRAS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.ganhos_extras (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ganhos_extras' AND column_name = 'user_id') THEN
        ALTER TABLE public.ganhos_extras ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ganhos_extras' AND column_name = 'descricao') THEN
        ALTER TABLE public.ganhos_extras ADD COLUMN descricao TEXT NOT NULL DEFAULT 'Ganho';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ganhos_extras' AND column_name = 'valor') THEN
        ALTER TABLE public.ganhos_extras ADD COLUMN valor DECIMAL(10, 2) NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ganhos_extras' AND column_name = 'tipo') THEN
        ALTER TABLE public.ganhos_extras ADD COLUMN tipo TEXT CHECK (tipo IN ('frete', 'excursao', 'ajuda', 'presente', 'outro')) NOT NULL DEFAULT 'outro';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ganhos_extras' AND column_name = 'data_ganho') THEN
        ALTER TABLE public.ganhos_extras ADD COLUMN data_ganho DATE DEFAULT CURRENT_DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ganhos_extras' AND column_name = 'observacoes') THEN
        ALTER TABLE public.ganhos_extras ADD COLUMN observacoes TEXT;
    END IF;
END $$;

ALTER TABLE public.ganhos_extras ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios ganhos extras" ON public.ganhos_extras;
CREATE POLICY "Usuários podem ver seus próprios ganhos extras" ON public.ganhos_extras FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios ganhos extras" ON public.ganhos_extras;
CREATE POLICY "Usuários podem inserir seus próprios ganhos extras" ON public.ganhos_extras FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios ganhos extras" ON public.ganhos_extras;
CREATE POLICY "Usuários podem atualizar seus próprios ganhos extras" ON public.ganhos_extras FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios ganhos extras" ON public.ganhos_extras;
CREATE POLICY "Usuários podem deletar seus próprios ganhos extras" ON public.ganhos_extras FOR DELETE USING (auth.uid() = user_id);


-- ==========================================
-- 4. TABELA PAGAMENTOS MENSAIS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.pagamentos_mensais (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pagamentos_mensais' AND column_name = 'user_id') THEN
        ALTER TABLE public.pagamentos_mensais ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pagamentos_mensais' AND column_name = 'aluno_id') THEN
        ALTER TABLE public.pagamentos_mensais ADD COLUMN aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pagamentos_mensais' AND column_name = 'valor') THEN
        ALTER TABLE public.pagamentos_mensais ADD COLUMN valor DECIMAL(10, 2) NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pagamentos_mensais' AND column_name = 'mes') THEN
        ALTER TABLE public.pagamentos_mensais ADD COLUMN mes INTEGER NOT NULL DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pagamentos_mensais' AND column_name = 'ano') THEN
        ALTER TABLE public.pagamentos_mensais ADD COLUMN ano INTEGER NOT NULL DEFAULT 2024;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pagamentos_mensais' AND column_name = 'status') THEN
        ALTER TABLE public.pagamentos_mensais ADD COLUMN status TEXT CHECK (status IN ('pago', 'nao_pago', 'em_aberto', 'atrasado')) DEFAULT 'em_aberto';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pagamentos_mensais' AND column_name = 'data_pagamento') THEN
        ALTER TABLE public.pagamentos_mensais ADD COLUMN data_pagamento DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pagamentos_mensais' AND column_name = 'data_vencimento') THEN
        ALTER TABLE public.pagamentos_mensais ADD COLUMN data_vencimento DATE;
    END IF;
END $$;

ALTER TABLE public.pagamentos_mensais ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios pagamentos" ON public.pagamentos_mensais;
CREATE POLICY "Usuários podem ver seus próprios pagamentos" ON public.pagamentos_mensais FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios pagamentos" ON public.pagamentos_mensais;
CREATE POLICY "Usuários podem inserir seus próprios pagamentos" ON public.pagamentos_mensais FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios pagamentos" ON public.pagamentos_mensais;
CREATE POLICY "Usuários podem atualizar seus próprios pagamentos" ON public.pagamentos_mensais FOR UPDATE USING (auth.uid() = user_id);


-- ==========================================
-- 5. TABELA VANS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.vans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vans' AND column_name = 'user_id') THEN
        ALTER TABLE public.vans ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vans' AND column_name = 'nome') THEN
        ALTER TABLE public.vans ADD COLUMN nome TEXT NOT NULL DEFAULT 'Minha Van';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vans' AND column_name = 'modelo') THEN
        ALTER TABLE public.vans ADD COLUMN modelo TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vans' AND column_name = 'placa') THEN
        ALTER TABLE public.vans ADD COLUMN placa TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vans' AND column_name = 'ano') THEN
        ALTER TABLE public.vans ADD COLUMN ano INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vans' AND column_name = 'capacidade_maxima') THEN
        ALTER TABLE public.vans ADD COLUMN capacidade_maxima INTEGER DEFAULT 15;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vans' AND column_name = 'ativo') THEN
        ALTER TABLE public.vans ADD COLUMN ativo BOOLEAN DEFAULT true;
    END IF;
END $$;

ALTER TABLE public.vans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias vans" ON public.vans;
CREATE POLICY "Usuários podem ver suas próprias vans" ON public.vans FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias vans" ON public.vans;
CREATE POLICY "Usuários podem inserir suas próprias vans" ON public.vans FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias vans" ON public.vans;
CREATE POLICY "Usuários podem atualizar suas próprias vans" ON public.vans FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias vans" ON public.vans;
CREATE POLICY "Usuários podem deletar suas próprias vans" ON public.vans FOR DELETE USING (auth.uid() = user_id);


-- ==========================================
-- 6. TABELA MANUTENCOES_FROTA
-- ==========================================
CREATE TABLE IF NOT EXISTS public.manutencoes_frota (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'manutencoes_frota' AND column_name = 'user_id') THEN
        ALTER TABLE public.manutencoes_frota ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'manutencoes_frota' AND column_name = 'van_id') THEN
        ALTER TABLE public.manutencoes_frota ADD COLUMN van_id UUID REFERENCES public.vans(id); 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'manutencoes_frota' AND column_name = 'data_manutencao') THEN
        ALTER TABLE public.manutencoes_frota ADD COLUMN data_manutencao DATE DEFAULT CURRENT_DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'manutencoes_frota' AND column_name = 'tipo') THEN
        ALTER TABLE public.manutencoes_frota ADD COLUMN tipo TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'manutencoes_frota' AND column_name = 'descricao') THEN
        ALTER TABLE public.manutencoes_frota ADD COLUMN descricao TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'manutencoes_frota' AND column_name = 'status') THEN
        ALTER TABLE public.manutencoes_frota ADD COLUMN status TEXT DEFAULT 'pendente';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'manutencoes_frota' AND column_name = 'custo') THEN
        ALTER TABLE public.manutencoes_frota ADD COLUMN custo DECIMAL(10, 2);
    END IF;
END $$;

ALTER TABLE public.manutencoes_frota ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários ver manutencoes" ON public.manutencoes_frota;
CREATE POLICY "Usuários ver manutencoes" ON public.manutencoes_frota FOR SELECT USING (
  auth.uid() = user_id OR van_id IN (SELECT id FROM public.vans WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "Usuários inserir manutencoes" ON public.manutencoes_frota;
CREATE POLICY "Usuários inserir manutencoes" ON public.manutencoes_frota FOR INSERT WITH CHECK (
  auth.uid() = user_id OR van_id IN (SELECT id FROM public.vans WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "Usuários atualizar manutencoes" ON public.manutencoes_frota;
CREATE POLICY "Usuários atualizar manutencoes" ON public.manutencoes_frota FOR UPDATE USING (
  auth.uid() = user_id OR van_id IN (SELECT id FROM public.vans WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "Usuários deletar manutencoes" ON public.manutencoes_frota;
CREATE POLICY "Usuários deletar manutencoes" ON public.manutencoes_frota FOR DELETE USING (
  auth.uid() = user_id OR van_id IN (SELECT id FROM public.vans WHERE user_id = auth.uid())
);


-- ==========================================
-- 7. TABELA LISTA_PRESENCA (Correção)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.lista_presenca (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lista_presenca' AND column_name = 'user_id') THEN
        ALTER TABLE public.lista_presenca ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lista_presenca' AND column_name = 'aluno_id') THEN
        ALTER TABLE public.lista_presenca ADD COLUMN aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lista_presenca' AND column_name = 'data') THEN
        ALTER TABLE public.lista_presenca ADD COLUMN data DATE DEFAULT CURRENT_DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lista_presenca' AND column_name = 'status') THEN
        ALTER TABLE public.lista_presenca ADD COLUMN status TEXT CHECK (status IN ('presente', 'ausente')) DEFAULT 'presente';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lista_presenca' AND column_name = 'turno') THEN
        ALTER TABLE public.lista_presenca ADD COLUMN turno TEXT DEFAULT 'manha';
    END IF;
END $$;

ALTER TABLE public.lista_presenca ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários ver presenca" ON public.lista_presenca;
CREATE POLICY "Usuários ver presenca" ON public.lista_presenca FOR SELECT USING (
  auth.uid() = user_id OR aluno_id IN (SELECT id FROM public.alunos WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "Usuários gerenciar presenca" ON public.lista_presenca;
CREATE POLICY "Usuários gerenciar presenca" ON public.lista_presenca FOR ALL USING (
  auth.uid() = user_id OR aluno_id IN (SELECT id FROM public.alunos WHERE user_id = auth.uid())
);


-- ==========================================
-- 8. TABELA CONSULTORES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.consultores (
    uid UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.consultores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Consultor vê seus dados" ON public.consultores;
CREATE POLICY "Consultor vê seus dados" ON public.consultores FOR ALL USING (auth.uid() = uid);
