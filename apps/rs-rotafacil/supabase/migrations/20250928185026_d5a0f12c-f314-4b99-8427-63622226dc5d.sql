-- Criar tabela para registrar presenças diárias dos alunos
CREATE TABLE public.presencas_diarias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'presente' CHECK (status IN ('presente', 'ausente')),
  horario_marcacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  marcado_por UUID REFERENCES auth.users(id),
  observacoes TEXT,
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraint para evitar duplicatas (um aluno por data)
  UNIQUE(aluno_id, data, user_id)
);

-- Habilitar RLS
ALTER TABLE public.presencas_diarias ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuários autenticados
CREATE POLICY "Users can view their own presencas_diarias"
ON public.presencas_diarias
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own presencas_diarias"
ON public.presencas_diarias
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presencas_diarias"
ON public.presencas_diarias
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presencas_diarias"
ON public.presencas_diarias
FOR DELETE
USING (auth.uid() = user_id);

-- Políticas para o usuário padrão (sem autenticação)
CREATE POLICY "Public view default presencas_diarias"
ON public.presencas_diarias
FOR SELECT
USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Public insert default presencas_diarias"
ON public.presencas_diarias
FOR INSERT
WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Public update default presencas_diarias"
ON public.presencas_diarias
FOR UPDATE
USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Public delete default presencas_diarias"
ON public.presencas_diarias
FOR DELETE
USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_presencas_diarias_updated_at
BEFORE UPDATE ON public.presencas_diarias
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar coluna nome_colegio na tabela alunos se não existir
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alunos' AND column_name='nome_colegio') THEN
    ALTER TABLE public.alunos ADD COLUMN nome_colegio TEXT NOT NULL DEFAULT 'Colégio Não Informado';
  END IF;
END $$;