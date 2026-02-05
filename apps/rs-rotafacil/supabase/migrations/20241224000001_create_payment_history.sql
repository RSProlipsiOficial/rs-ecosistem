-- Criar tabela de histórico de pagamentos
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  payment_method VARCHAR(50) NOT NULL, -- mercadopago, asaas, admin, etc
  payment_status VARCHAR(20) NOT NULL, -- pending, approved, rejected, refunded
  external_payment_id VARCHAR(255), -- ID do pagamento no gateway (MercadoPago, Asaas)
  external_reference VARCHAR(255), -- Referência externa
  payment_data JSONB, -- Dados completos do pagamento
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX idx_payment_history_subscription_id ON public.payment_history(subscription_id);
CREATE INDEX idx_payment_history_status ON public.payment_history(payment_status);
CREATE INDEX idx_payment_history_created_at ON public.payment_history(created_at DESC);

-- RLS
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own payment history" 
  ON public.payment_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all payment history" 
  ON public.payment_history FOR SELECT 
  USING (is_admin());

CREATE POLICY "System can insert payment history" 
  ON public.payment_history FOR INSERT 
  WITH CHECK (true); -- Webhooks precisam inserir

CREATE POLICY "Admin can manage all payment history" 
  ON public.payment_history FOR ALL 
  USING (is_admin());

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_payment_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_history_updated_at
  BEFORE UPDATE ON public.payment_history
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_history_updated_at();
