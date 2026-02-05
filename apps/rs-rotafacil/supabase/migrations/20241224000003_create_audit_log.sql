-- Criar tabela de log de auditoria
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- create, update, delete, login, logout, etc
  table_name VARCHAR(100), -- Nome da tabela afetada
  record_id UUID, -- ID do registro afetado
  old_data JSONB, -- Dados antes da mudança
  new_data JSONB, -- Dados depois da mudança
  ip_address INET, -- IP do usuário
  user_agent TEXT, -- User agent do navegador
  metadata JSONB, -- Metadados adicionais
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_action ON public.audit_log(action);
CREATE INDEX idx_audit_log_table_name ON public.audit_log(table_name);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX idx_audit_log_record_id ON public.audit_log(record_id);

-- RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (apenas admin pode ver logs)
CREATE POLICY "Only admin can view audit logs" 
  ON public.audit_log FOR SELECT 
  USING (is_admin());

CREATE POLICY "System can insert audit logs" 
  ON public.audit_log FOR INSERT 
  WITH CHECK (true); -- Triggers precisam inserir

CREATE POLICY "Admin can manage audit logs" 
  ON public.audit_log FOR ALL 
  USING (is_admin());

-- Função helper para criar log de auditoria
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

-- Trigger para auditar mudanças em user_subscriptions
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

CREATE TRIGGER audit_user_subscriptions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION audit_user_subscriptions();
