-- Migration: Update Subscription Plans to 8-Tier System
-- Created: 2025-12-29
-- Description: Implements complete 8-tier subscription system (Kits 0-7) with proper limits

-- 1. Update enum to support all plan types
ALTER TYPE public.subscription_plan_type ADD VALUE IF NOT EXISTS 'inicial';
ALTER TYPE public.subscription_plan_type ADD VALUE IF NOT EXISTS 'crescimento';
ALTER TYPE public.subscription_plan_type ADD VALUE IF NOT EXISTS 'profissional';
ALTER TYPE public.subscription_plan_type ADD VALUE IF NOT EXISTS 'empresarial';
ALTER TYPE public.subscription_plan_type ADD VALUE IF NOT EXISTS 'enterprise';
ALTER TYPE public.subscription_plan_type ADD VALUE IF NOT EXISTS 'unlimited';
ALTER TYPE public.subscription_plan_type ADD VALUE IF NOT EXISTS 'custom';

-- 2. Desativar planos antigos (manter histórico)
UPDATE public.subscription_plans SET active = false WHERE active = true;

-- 3. Inserir Kit 0 - Grátis
INSERT INTO public.subscription_plans (name, description, price, plan_type, features, limitations, active)
VALUES (
  'Grátis',
  '7 dias de acesso total, depois limitado a 1 van e 15 alunos',
  0.00,
  'free',
  jsonb_build_array(
    '7 dias de acesso total',
    'Assistente RS-IA básico',
    'Suporte via WhatsApp',
    '1 Van (limitado após trial)',
    '15 alunos (limitado após trial)',
    '10 gastos mensais'
  ),
  jsonb_build_object(
    'max_vans', 1,
    'max_alunos', 15,
    'max_expenses', 10,
    'trial_days', 7,
    'ai_assistant_included', true,
    'ai_assistant_mode', 'basic',
    'financial_module', 'basic',
    'education_module', 'limited',
    'export_advanced', false,
    'multiuser', false
  ),
  true
);

-- 4. Inserir Kit 1 - Inicial
INSERT INTO public.subscription_plans (name, description, price, plan_type, features, limitations, active)
VALUES (
  'Inicial',
  'Ideal para começar seu negócio de transporte escolar',
  14.90,
  'inicial',
  jsonb_build_array(
    '1 Van',
    'Até 60 alunos',
    'Financeiro completo',
    'Controle de ganhos e gastos',
    'Planilha integrada',
    'Educação financeira básica',
    'Assistente RS-IA padrão',
    'WhatsApp básico (cobrança simples)'
  ),
  jsonb_build_object(
    'max_vans', 1,
    'max_alunos', 60,
    'max_expenses', null,
    'ai_assistant_included', true,
    'ai_assistant_mode', 'standard',
    'financial_module', 'complete',
    'education_module', 'basic',
    'whatsapp_integration', 'basic',
    'multiuser', false
  ),
  true
);

-- 5. Inserir Kit 2 - Crescimento
INSERT INTO public.subscription_plans (name, description, price, plan_type, features, limitations, active)
VALUES (
  'Crescimento',
  'Para quem está expandindo e precisa de mais controle',
  29.90,
  'crescimento',
  jsonb_build_array(
    '2 Vans',
    'Até 150 alunos',
    'Relatórios por van',
    'Comparativo mensal',
    'Visão de lucro por rota',
    'Educação financeira intermediária',
    'Assistente RS-IA padrão',
    'WhatsApp integrado'
  ),
  jsonb_build_object(
    'max_vans', 2,
    'max_alunos', 150,
    'max_expenses', null,
    'ai_assistant_included', true,
    'ai_assistant_mode', 'standard',
    'financial_module', 'complete',
    'education_module', 'intermediate',
    'reports_by_van', true,
    'monthly_comparison', true,
    'multiuser', false
  ),
  true
);

-- 6. Inserir Kit 3 - Profissional
INSERT INTO public.subscription_plans (name, description, price, plan_type, features, limitations, active)
VALUES (
  'Profissional',
  'Gestão completa para operações profissionais',
  139.90,
  'profissional',
  jsonb_build_array(
    '5 Vans',
    'Até 800 alunos',
    'Gestão financeira avançada',
    'Exportar dados',
    'Histórico mensal/anual',
    'Educação financeira completa',
    'Assistente RS-IA com relatórios',
    'Multiusuário limitado',
    'Suporte prioritário'
  ),
  jsonb_build_object(
    'max_vans', 5,
    'max_alunos', 800,
    'max_expenses', null,
    'ai_assistant_included', true,
    'ai_assistant_mode', 'advanced',
    'financial_module', 'advanced',
    'education_module', 'complete',
    'export_data', true,
    'historical_data', true,
    'multiuser', 'limited',
    'priority_support', false
  ),
  true
);

-- 7. Inserir Kit 4 - Empresarial
INSERT INTO public.subscription_plans (name, description, price, plan_type, features, limitations, active)
VALUES (
  'Empresarial',
  'Solução empresarial para grandes operações',
  597.00,
  'empresarial',
  jsonb_build_array(
    '50 Vans',
    'Até 6.500 alunos',
    'Multiusuário completo',
    'Relatórios consolidados',
    'Planejamento financeiro',
    'Simulação de crescimento',
    'IA ativa para análise financeira',
    'Suporte prioritário',
    'Treinamento incluído'
  ),
  jsonb_build_object(
    'max_vans', 50,
    'max_alunos', 6500,
    'max_expenses', null,
    'ai_assistant_included', true,
    'ai_assistant_mode', 'advanced',
    'financial_module', 'advanced',
    'education_module', 'complete',
    'multiuser', 'complete',
    'consolidated_reports', true,
    'financial_planning', true,
    'growth_simulation', true,
    'priority_support', true
  ),
  true
);

-- 8. Inserir Kit 5 - Enterprise
INSERT INTO public.subscription_plans (name, description, price, plan_type, features, limitations, active)
VALUES (
  'Enterprise',
  'Infraestrutura reforçada para grandes corporações',
  1497.00,
  'enterprise',
  jsonb_build_array(
    '150 Vans',
    'Até 18.000 alunos',
    'IA avançada',
    'Relatórios estratégicos',
    'Infraestrutura reforçada',
    'Atendimento prioritário',
    'Financeiro corporativo',
    'SLA garantido',
    'Gerente de conta dedicado'
  ),
  jsonb_build_object(
    'max_vans', 150,
    'max_alunos', 18000,
    'max_expenses', null,
    'ai_assistant_included', true,
    'ai_assistant_mode', 'enterprise',
    'financial_module', 'corporate',
    'education_module', 'complete',
    'multiuser', 'complete',
    'priority_support', true,
    'strategic_reports', true,
    'reinforced_infrastructure', true,
    'sla_guaranteed', true
  ),
  true
);

-- 9. Inserir Kit 6 - Ilimitado (Sob Demanda)
INSERT INTO public.subscription_plans (name, description, price, plan_type, features, limitations, active)
VALUES (
  'Ilimitado',
  'Recursos ilimitados com infraestrutura dedicada - Sob consulta',
  null,
  'unlimited',
  jsonb_build_array(
    'Vans ilimitadas',
    'Alunos ilimitados',
    'Infra dedicada',
    'SLA personalizado',
    'Contrato específico',
    'IA sem limites',
    'Suporte VIP 24/7',
    'Customizações sob medida'
  ),
  jsonb_build_object(
    'max_vans', null,
    'max_alunos', null,
    'max_expenses', null,
    'ai_assistant_included', true,
    'ai_assistant_mode', 'unlimited',
    'dedicated_infrastructure', true,
    'custom_sla', true,
    'vip_support', true,
    'manual_activation', true,
    'contact_sales', true
  ),
  true
);

-- 10. Inserir Kit 7 - Personalizado
INSERT INTO public.subscription_plans (name, description, price, plan_type, features, limitations, active)
VALUES (
  'Personalizado',
  'Plano customizado para necessidades específicas',
  null,
  'custom',
  jsonb_build_array(
    'Limites personalizados',
    'Módulos sob medida',
    'Contrato específico',
    'Ajuste fino de recursos',
    'Suporte dedicado'
  ),
  jsonb_build_object(
    'customizable', true,
    'manual_activation', true,
    'contact_sales', true
  ),
  true
);

-- 11. Criar função para verificar limites do plano
CREATE OR REPLACE FUNCTION public.check_plan_limit(
  p_user_id UUID,
  p_limit_type TEXT,
  p_current_count INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_limit INTEGER;
  v_subscription RECORD;
BEGIN
  -- Get active subscription
  SELECT us.*, sp.limitations
  INTO v_subscription
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
    AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;

  -- If no subscription, use free plan limits
  IF v_subscription IS NULL THEN
    CASE p_limit_type
      WHEN 'vans' THEN v_limit := 1;
      WHEN 'alunos' THEN v_limit := 15;
      WHEN 'expenses' THEN v_limit := 10;
      ELSE v_limit := 0;
    END CASE;
  ELSE
    -- Extract limit from JSON
    v_limit := (v_subscription.limitations->>'max_' || p_limit_type)::INTEGER;
  END IF;

  -- NULL means unlimited
  IF v_limit IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Check if current count is below limit
  RETURN p_current_count < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Comentários para documentação
COMMENT ON TABLE public.subscription_plans IS 'Planos de assinatura disponíveis no sistema (8 kits: Grátis, Inicial, Crescimento, Profissional, Empresarial, Enterprise, Ilimitado, Personalizado)';
COMMENT ON COLUMN public.subscription_plans.limitations IS 'Limites e recursos do plano em formato JSON (max_vans, max_alunos, max_expenses, etc.)';
COMMENT ON FUNCTION public.check_plan_limit IS 'Verifica se o usuário pode adicionar mais recursos baseado no plano atual';
