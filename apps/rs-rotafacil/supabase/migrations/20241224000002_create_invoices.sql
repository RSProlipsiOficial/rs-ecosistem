-- Criar tabela de faturas/notas fiscais
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
  payment_history_id UUID REFERENCES public.payment_history(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50) UNIQUE NOT NULL, -- Número sequencial da fatura
  amount DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, paid, cancelled, refunded
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  paid_date DATE,
  description TEXT,
  items JSONB, -- Itens da fatura
  customer_data JSONB, -- Dados do cliente no momento da emissão
  pdf_url TEXT, -- URL do PDF da fatura
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_subscription_id ON public.invoices(subscription_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_issue_date ON public.invoices(issue_date DESC);
CREATE INDEX idx_invoices_invoice_number ON public.invoices(invoice_number);

-- RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own invoices" 
  ON public.invoices FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all invoices" 
  ON public.invoices FOR SELECT 
  USING (is_admin());

CREATE POLICY "Admin can manage all invoices" 
  ON public.invoices FOR ALL 
  USING (is_admin());

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_invoices_updated_at();

-- Função para gerar número de fatura sequencial
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  year_month TEXT;
BEGIN
  year_month := TO_CHAR(CURRENT_DATE, 'YYYYMM');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 8) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.invoices
  WHERE invoice_number LIKE year_month || '%';
  
  RETURN year_month || LPAD(next_number::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;
