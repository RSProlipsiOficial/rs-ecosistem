-- Migration: Add MiniSite Specific Plans
-- Created: 2026-01-26

-- Add new plan types if not exists
ALTER TYPE public.subscription_plan_type ADD VALUE IF NOT EXISTS 'minisite_start';
ALTER TYPE public.subscription_plan_type ADD VALUE IF NOT EXISTS 'minisite_pro';
ALTER TYPE public.subscription_plan_type ADD VALUE IF NOT EXISTS 'minisite_agency';

-- Insert MiniSite Start
INSERT INTO public.subscription_plans (id, name, description, price, plan_type, features, limitations, active)
VALUES (
  'e0a9d0a0-0001-4000-8000-000000000001',
  'RS MiniSite Start',
  '1 MiniSite, sem marca RS Prólipsi',
  5.90,
  'minisite_start',
  jsonb_build_array('1 MiniSite', 'Recursos liberados', 'Sem marca RS Prólipsi'),
  jsonb_build_object('max_pages', 1, 'max_clients', 0),
  true
) ON CONFLICT (id) DO UPDATE SET price = 5.90, active = true;

-- Insert MiniSite Pro
INSERT INTO public.subscription_plans (id, name, description, price, plan_type, features, limitations, active)
VALUES (
  'e0a9d0a0-0002-4000-8000-000000000002',
  'RS MiniSite Pro',
  'Até 10 MiniSites, recursos liberados',
  19.90,
  'minisite_pro',
  jsonb_build_array('Até 10 MiniSites', 'Recursos liberados', 'Sem marcas'),
  jsonb_build_object('max_pages', 10, 'max_clients', 0),
  true
) ON CONFLICT (id) DO UPDATE SET price = 19.90, active = true;

-- Insert MiniSite Agente
INSERT INTO public.subscription_plans (id, name, description, price, plan_type, features, limitations, active)
VALUES (
  'e0a9d0a0-0003-4000-8000-000000000003',
  'RS MiniSite Agente',
  'Gestão de clientes e White-label',
  129.90,
  'minisite_agency',
  jsonb_build_array(
    'Acessos e Sub-contas',
    'Gestão de até 100 clientes (0% taxa)',
    'Marca Própria (White-label)'
  ),
  jsonb_build_object('max_pages', 500, 'max_clients', 100),
  true
) ON CONFLICT (id) DO UPDATE SET price = 129.90, active = true;
