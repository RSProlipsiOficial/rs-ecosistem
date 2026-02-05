-- Criar tabela para armazenar cobranças PIX de matrícula
CREATE TABLE IF NOT EXISTS public.aluno_pix_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  brcode TEXT, -- QR Code copia e cola ou chave PIX estática
  qr_code_base64 TEXT, -- QR Code em base64 do Mercado Pago
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, EXPIRED, CANCELED
  payment_method TEXT, -- 'mercadopago_dynamic', 'pix_static'
  mp_payment_id TEXT, -- ID do pagamento no Mercado Pago (se dinâmico)
  paid_at TIMESTAMPTZ, -- Data de confirmação do pagamento
  expires_at TIMESTAMPTZ, -- Data de expiração da cobrança
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_aluno_pix_charges_aluno_id ON public.aluno_pix_charges(aluno_id);
CREATE INDEX idx_aluno_pix_charges_tenant_id ON public.aluno_pix_charges(tenant_id);
CREATE INDEX idx_aluno_pix_charges_status ON public.aluno_pix_charges(status);
CREATE INDEX idx_aluno_pix_charges_created_at ON public.aluno_pix_charges(created_at DESC);

-- RLS
ALTER TABLE public.aluno_pix_charges ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Transportador (tenant) pode ver suas próprias cobranças
CREATE POLICY "Tenant can view own charges" 
  ON public.aluno_pix_charges FOR SELECT 
  USING (auth.uid() = tenant_id);

-- EdgeFunction/Sistema pode inserir
CREATE POLICY "System can insert charges" 
  ON public.aluno_pix_charges FOR INSERT 
  WITH CHECK (true);

-- Sistema/Webhook pode atualizar status
CREATE POLICY "System can update charges" 
  ON public.aluno_pix_charges FOR UPDATE 
  USING (true);

-- Admin pode ver todas
CREATE POLICY "Admin can view all charges" 
  ON public.aluno_pix_charges FOR SELECT 
  USING (is_admin());

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_aluno_pix_charges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER aluno_pix_charges_updated_at
  BEFORE UPDATE ON public.aluno_pix_charges
  FOR EACH ROW
  EXECUTE FUNCTION update_aluno_pix_charges_updated_at();

-- RPC para consultar status de pagamento PIX de um aluno
CREATE OR REPLACE FUNCTION get_aluno_pix_status(p_aluno_id UUID)
RETURNS JSON AS $$
DECLARE
  v_charge RECORD;
  v_result JSON;
BEGIN
  -- Buscar a cobrança mais recente do aluno
  SELECT * INTO v_charge
  FROM aluno_pix_charges
  WHERE aluno_id = p_aluno_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- Se não encontrou, retornar not found
  IF v_charge IS NULL THEN
    RETURN json_build_object(
      'found', FALSE
    );
  END IF;

  -- Retornar dados da cobrança
  RETURN json_build_object(
    'found', TRUE,
    'status', v_charge.status,
    'amount', v_charge.amount,
    'brcode', v_charge.brcode,
    'qr_code_base64', v_charge.qr_code_base64,
    'expires_at', v_charge.expires_at,
    'paid_at', v_charge.paid_at,
    'created_at', v_charge.created_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
