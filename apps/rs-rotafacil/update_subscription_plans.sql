-- Atualizar Plano Básico
UPDATE public.subscription_plans 
SET 
  price = 14.99,
  features = '["60 Alunos", "1 Van", "Suporte WhatsApp", "Controle de Gastos", "WhatsApp Integrado"]'::jsonb,
  limitations = '{"max_vans": 1, "max_alunos": 60}'::jsonb
WHERE plan_type = 'basico';

-- Atualizar Plano Profissional
UPDATE public.subscription_plans 
SET 
  name = 'Plano Profissional',
  price = 139.90,
  features = '["800 Alunos", "5 Vans", "Suporte prioritário", "Relatórios avançados", "Gestão de Equipe"]'::jsonb,
  limitations = '{"max_vans": 5, "max_alunos": 800}'::jsonb
WHERE plan_type = 'empresarial';

-- Atualizar Plano Empresarial
UPDATE public.subscription_plans 
SET 
  name = 'Plano Empresarial',
  price = 1500.00,
  features = '["10.000 Alunos", "100 Vans", "Suporte dedicado", "API Access", "Custom Reports"]'::jsonb,
  limitations = '{"max_vans": 100, "max_alunos": 10000}'::jsonb
WHERE plan_type = 'ilimitado';

-- Desativar Plano Premium antigo
UPDATE public.subscription_plans 
SET active = false 
WHERE plan_type = 'premium';
