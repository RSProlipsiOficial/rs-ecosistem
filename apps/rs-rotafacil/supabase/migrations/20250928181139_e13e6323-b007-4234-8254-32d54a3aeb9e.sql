-- Criar tabela para checklists diários do motorista
CREATE TABLE public.checklists_motorista (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  van_id UUID NOT NULL,
  data DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'revisado' CHECK (status IN ('revisado', 'nao_revisado')),
  horario_preenchimento TIME NOT NULL DEFAULT NOW()::TIME,
  fora_horario BOOLEAN NOT NULL DEFAULT false,
  
  -- Itens do checklist (todos obrigatórios)
  pneus BOOLEAN NOT NULL DEFAULT false,
  estepe BOOLEAN NOT NULL DEFAULT false,
  oleo_motor BOOLEAN NOT NULL DEFAULT false,
  agua_radiador BOOLEAN NOT NULL DEFAULT false,
  freios BOOLEAN NOT NULL DEFAULT false,
  luzes_externas BOOLEAN NOT NULL DEFAULT false,
  cinto_seguranca BOOLEAN NOT NULL DEFAULT false,
  limpador_parabrisa BOOLEAN NOT NULL DEFAULT false,
  vidros_retrovisores BOOLEAN NOT NULL DEFAULT false,
  itens_soltos BOOLEAN NOT NULL DEFAULT false,
  portas_trancas BOOLEAN NOT NULL DEFAULT false,
  
  -- Campos específicos
  combustivel NUMERIC CHECK (combustivel >= 0 AND combustivel <= 100),
  quilometragem NUMERIC NOT NULL DEFAULT 0,
  observacoes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraint para garantir um checklist por dia por van
  UNIQUE(user_id, van_id, data)
);

-- Habilitar RLS
ALTER TABLE public.checklists_motorista ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own checklists" 
ON public.checklists_motorista 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own checklists" 
ON public.checklists_motorista 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checklists" 
ON public.checklists_motorista 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checklists" 
ON public.checklists_motorista 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_checklists_motorista_updated_at
BEFORE UPDATE ON public.checklists_motorista
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();