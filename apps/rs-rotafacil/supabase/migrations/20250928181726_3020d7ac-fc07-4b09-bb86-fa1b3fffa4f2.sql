-- Criar tabela para itens personalizados do checklist
CREATE TABLE public.checklist_items_personalizados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 0,
  obrigatorio BOOLEAN NOT NULL DEFAULT true,
  tipo TEXT NOT NULL DEFAULT 'boolean' CHECK (tipo IN ('boolean', 'number', 'text')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.checklist_items_personalizados ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own custom items" 
ON public.checklist_items_personalizados 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom items" 
ON public.checklist_items_personalizados 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom items" 
ON public.checklist_items_personalizados 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom items" 
ON public.checklist_items_personalizados 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_checklist_items_personalizados_updated_at
BEFORE UPDATE ON public.checklist_items_personalizados
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir itens padrão do checklist para migração
INSERT INTO public.checklist_items_personalizados (user_id, nome, descricao, ordem, tipo) 
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Pneus', 'Verificar estado e calibragem', 1, 'boolean'),
  ('00000000-0000-0000-0000-000000000000', 'Estepe', 'Verificar se está em boas condições', 2, 'boolean'),
  ('00000000-0000-0000-0000-000000000000', 'Óleo do motor', 'Conferir nível e validade', 3, 'boolean'),
  ('00000000-0000-0000-0000-000000000000', 'Água do radiador', 'Verificar nível', 4, 'boolean'),
  ('00000000-0000-0000-0000-000000000000', 'Freios', 'Testar pedal, ruído, resposta', 5, 'boolean'),
  ('00000000-0000-0000-0000-000000000000', 'Luzes externas', 'Verificar funcionamento completo (farol, seta, ré)', 6, 'boolean'),
  ('00000000-0000-0000-0000-000000000000', 'Cinto de segurança', 'Conferir se todos funcionam', 7, 'boolean'),
  ('00000000-0000-0000-0000-000000000000', 'Limpador de para-brisa', 'Testar funcionamento', 8, 'boolean'),
  ('00000000-0000-0000-0000-000000000000', 'Vidros e retrovisores', 'Conferir se estão limpos e íntegros', 9, 'boolean'),
  ('00000000-0000-0000-0000-000000000000', 'Itens soltos na van', 'Verificar se não há objetos soltos ou perigosos', 10, 'boolean'),
  ('00000000-0000-0000-0000-000000000000', 'Portas e trancas', 'Testar se abrem/fecham corretamente', 11, 'boolean');