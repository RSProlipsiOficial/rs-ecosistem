-- Criar função para gerar pagamentos mensais automaticamente
CREATE OR REPLACE FUNCTION public.gerar_pagamentos_mensais()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Gerar pagamento para o mês atual quando um aluno é cadastrado
  INSERT INTO public.pagamentos_mensais (
    aluno_id,
    mes,
    ano,
    valor,
    status,
    data_vencimento,
    user_id
  ) VALUES (
    NEW.id,
    EXTRACT(MONTH FROM CURRENT_DATE)::integer,
    EXTRACT(YEAR FROM CURRENT_DATE)::integer,
    NEW.valor_mensalidade,
    'nao_pago',
    (date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day')::date,
    NEW.user_id
  );
  
  RETURN NEW;
END;
$$;

-- Criar trigger para executar a função quando um aluno é inserido
CREATE TRIGGER trigger_gerar_pagamento_mensal
  AFTER INSERT ON public.alunos
  FOR EACH ROW
  EXECUTE FUNCTION public.gerar_pagamentos_mensais();

-- Adicionar políticas RLS para as novas tabelas relacionadas ao user_id
CREATE POLICY "Users can view their own pagamentos_mensais" 
ON public.pagamentos_mensais 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pagamentos_mensais" 
ON public.pagamentos_mensais 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pagamentos_mensais" 
ON public.pagamentos_mensais 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pagamentos_mensais" 
ON public.pagamentos_mensais 
FOR DELETE 
USING (auth.uid() = user_id);

-- Adicionar políticas para ganhos_extras se não existirem
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ganhos_extras' 
    AND policyname = 'Users can view their own ganhos_extras'
  ) THEN
    CREATE POLICY "Users can view their own ganhos_extras" 
    ON public.ganhos_extras 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ganhos_extras' 
    AND policyname = 'Users can create their own ganhos_extras'
  ) THEN
    CREATE POLICY "Users can create their own ganhos_extras" 
    ON public.ganhos_extras 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ganhos_extras' 
    AND policyname = 'Users can update their own ganhos_extras'
  ) THEN
    CREATE POLICY "Users can update their own ganhos_extras" 
    ON public.ganhos_extras 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ganhos_extras' 
    AND policyname = 'Users can delete their own ganhos_extras'
  ) THEN
    CREATE POLICY "Users can delete their own ganhos_extras" 
    ON public.ganhos_extras 
    FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Adicionar políticas para gastos se não existirem
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'gastos' 
    AND policyname = 'Users can view their own gastos'
  ) THEN
    CREATE POLICY "Users can view their own gastos" 
    ON public.gastos 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'gastos' 
    AND policyname = 'Users can create their own gastos'
  ) THEN
    CREATE POLICY "Users can create their own gastos" 
    ON public.gastos 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'gastos' 
    AND policyname = 'Users can update their own gastos'
  ) THEN
    CREATE POLICY "Users can update their own gastos" 
    ON public.gastos 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'gastos' 
    AND policyname = 'Users can delete their own gastos'
  ) THEN
    CREATE POLICY "Users can delete their own gastos" 
    ON public.gastos 
    FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;
END $$;