-- Criar tabela para manutenções/defeitos da van
CREATE TABLE public.manutencoes_van (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  van_id UUID NOT NULL,
  data_relato DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo_problema TEXT NOT NULL DEFAULT 'geral'::text,
  descricao_problema TEXT NOT NULL,
  prioridade TEXT NOT NULL DEFAULT 'media'::text,
  status TEXT NOT NULL DEFAULT 'pendente'::text,
  data_solucao DATE,
  observacoes_solucao TEXT,
  custo_reparo NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.manutencoes_van ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can create their own manutencoes_van" 
ON public.manutencoes_van 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own manutencoes_van" 
ON public.manutencoes_van 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own manutencoes_van" 
ON public.manutencoes_van 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own manutencoes_van" 
ON public.manutencoes_van 
FOR DELETE 
USING (auth.uid() = user_id);

-- Criar trigger para updated_at
CREATE TRIGGER update_manutencoes_van_updated_at
BEFORE UPDATE ON public.manutencoes_van
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();