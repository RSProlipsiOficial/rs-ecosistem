-- Primeiro, expandir o enum para incluir todos os tipos de planos
ALTER TYPE subscription_plan_type ADD VALUE IF NOT EXISTS 'basic';
ALTER TYPE subscription_plan_type ADD VALUE IF NOT EXISTS 'professional'; 
ALTER TYPE subscription_plan_type ADD VALUE IF NOT EXISTS 'unlimited';