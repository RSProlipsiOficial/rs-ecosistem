-- Criar função para atualizar updated_at primeiro
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar tabelas para o sistema de gerenciamento de alunos por van

-- Tabela de vans
CREATE TABLE public.vans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  capacidade_maxima INTEGER NOT NULL DEFAULT 20,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de alunos
CREATE TABLE public.alunos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_completo TEXT NOT NULL,
  nome_responsavel TEXT NOT NULL,
  turno TEXT NOT NULL CHECK (turno IN ('manha', 'tarde', 'integral', 'noite')),
  serie TEXT NOT NULL,
  
  -- Endereço
  endereco_rua TEXT NOT NULL,
  endereco_numero TEXT NOT NULL,
  endereco_bairro TEXT NOT NULL,
  endereco_cidade TEXT NOT NULL,
  endereco_estado TEXT NOT NULL,
  endereco_cep TEXT NOT NULL,
  tipo_residencia TEXT NOT NULL DEFAULT 'casa' CHECK (tipo_residencia IN ('casa', 'apartamento', 'outro')),
  
  -- Contato
  whatsapp_responsavel TEXT NOT NULL,
  
  -- Financeiro
  valor_mensalidade NUMERIC(10,2) NOT NULL DEFAULT 0,
  valor_letalidade NUMERIC(10,2) DEFAULT 0,
  
  -- Relacionamentos
  van_id UUID NOT NULL REFERENCES public.vans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.vans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

-- Políticas para vans
CREATE POLICY "Users can view their own vans" 
ON public.vans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vans" 
ON public.vans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vans" 
ON public.vans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vans" 
ON public.vans 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para alunos
CREATE POLICY "Users can view their own alunos" 
ON public.alunos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alunos" 
ON public.alunos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alunos" 
ON public.alunos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alunos" 
ON public.alunos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_vans_updated_at
  BEFORE UPDATE ON public.vans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alunos_updated_at
  BEFORE UPDATE ON public.alunos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();