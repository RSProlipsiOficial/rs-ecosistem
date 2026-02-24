-- ============================================
-- MIGRATION COMPLETA COM is_admin()
-- ============================================

-- Primeiro: Criar função is_admin() se não existir
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() ->> 'user_metadata' ->> 'user_type')::text = 'admin',
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PAYMENT_HISTORY
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(20) NOT NULL,
  external_payment_id VARCHAR(255),
  external_reference VARCHAR(255),
  payment_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription_id ON public.payment_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON public.payment_history(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON public.payment_history(created_at DESC);

ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payment history" ON public.payment_history;
CREATE POLICY "Users can view own payment history" ON public.payment_history FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can view all payment history" ON public.payment_history;
CREATE POLICY "Admin can view all payment history" ON public.payment_history FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "System can insert payment history" ON public.payment_history;
CREATE POLICY "System can insert payment history" ON public.payment_history FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can manage all payment history" ON public.payment_history;
CREATE POLICY "Admin can manage all payment history" ON public.payment_history FOR ALL USING (is_admin());

CREATE OR REPLACE FUNCTION update_payment_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payment_history_updated_at ON public.payment_history;
CREATE TRIGGER payment_history_updated_at
  BEFORE UPDATE ON public.payment_history
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_history_updated_at();

-- 2. INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
  payment_history_id UUID REFERENCES public.payment_history(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  paid_date DATE,
  description TEXT,
  items JSONB,
  customer_data JSONB,
  pdf_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON public.invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON public.invoices(issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices(invoice_number);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can view all invoices" ON public.invoices;
CREATE POLICY "Admin can view all invoices" ON public.invoices FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admin can manage all invoices" ON public.invoices;
CREATE POLICY "Admin can manage all invoices" ON public.invoices FOR ALL USING (is_admin());

CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS invoices_updated_at ON public.invoices;
CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_invoices_updated_at();

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

-- 3. AUDIT_LOG
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_record_id ON public.audit_log(record_id);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admin can view audit logs" ON public.audit_log;
CREATE POLICY "Only admin can view audit logs" ON public.audit_log FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_log;
CREATE POLICY "System can insert audit logs" ON public.audit_log FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can manage audit logs" ON public.audit_log;
CREATE POLICY "Admin can manage audit logs" ON public.audit_log FOR ALL USING (is_admin());

CREATE OR REPLACE FUNCTION create_audit_log(
  p_user_id UUID,
  p_action VARCHAR,
  p_table_name VARCHAR DEFAULT NULL,
  p_record_id UUID DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_log (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data,
    metadata
  ) VALUES (
    p_user_id,
    p_action,
    p_table_name,
    p_record_id,
    p_old_data,
    p_new_data,
    p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION audit_user_subscriptions()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM create_audit_log(
      NEW.user_id,
      'subscription_created',
      'user_subscriptions',
      NEW.id,
      NULL,
      to_jsonb(NEW),
      jsonb_build_object('plan_id', NEW.plan_id, 'status', NEW.status)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM create_audit_log(
      NEW.user_id,
      'subscription_updated',
      'user_subscriptions',
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW),
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'plan_id', NEW.plan_id
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM create_audit_log(
      OLD.user_id,
      'subscription_deleted',
      'user_subscriptions',
      OLD.id,
      to_jsonb(OLD),
      NULL,
      jsonb_build_object('plan_id', OLD.plan_id, 'status', OLD.status)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_user_subscriptions_trigger ON public.user_subscriptions;
CREATE TRIGGER audit_user_subscriptions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION audit_user_subscriptions();
