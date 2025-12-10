-- Agora inserir os novos planos conforme especificação
UPDATE subscription_plans SET
    name = 'Plano Grátis – Teste 7 Dias',
    description = '7 dias com acesso total, depois limitado a 20 alunos',
    price = 0.00,
    plan_type = 'free',
    features = '{"trial_days": 7, "max_vans": 1, "max_alunos": 20, "max_gastos": 10, "access_full_during_trial": true, "whatsapp_integrado": true, "checklists": true, "importacao_exportacao": true, "controle_financeiro": true}'::jsonb,
    limitations = '{"max_vans": 1, "max_alunos": 20, "max_gastos": 10}'::jsonb
WHERE plan_type = 'free';

UPDATE subscription_plans SET
    name = 'Plano Premium',
    description = 'Ideal para pequenas empresas com até 5 vans',
    price = 39.90,
    plan_type = 'premium',
    features = '{"max_vans": 5, "max_alunos": 300, "gastos_ilimitados": true, "todas_funcionalidades": true, "suporte_prioritario": true, "relatorios_avancados": true, "mensagens_automaticas": true, "gestao_financeira_pessoal": true, "tutoriais_treinamentos": true}'::jsonb,
    limitations = '{}'::jsonb
WHERE plan_type = 'premium';

-- Inserir novos planos
INSERT INTO subscription_plans (name, description, price, plan_type, features, limitations, active) 
SELECT 'Plano Básico', 'Para autônomos e pequenos transportadores com 1 van', 14.90, 'basic', 
       '{"max_vans": 1, "max_alunos": 100, "gastos_ilimitados": true, "whatsapp_integrado": true, "checklists": true, "relatorios_padrao": true, "suporte_whatsapp": true}'::jsonb,
       '{}'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE plan_type = 'basic');

INSERT INTO subscription_plans (name, description, price, plan_type, features, limitations, active) 
SELECT 'Plano Profissional', 'Para empresas médias com até 30 vans', 99.90, 'professional',
       '{"max_vans": 30, "max_alunos": 1000, "gastos_ilimitados": true, "todas_funcionalidades": true, "suporte_premium": true, "relatorios_completos": true, "agendamento_mensagens": true, "cobrancas_automaticas": true, "painel_completo": true}'::jsonb,
       '{}'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE plan_type = 'professional');

INSERT INTO subscription_plans (name, description, price, plan_type, features, limitations, active) 
SELECT 'Plano Ilimitado', 'Para grandes empresas ou cooperativas com acesso total', 299.90, 'unlimited',
       '{"vans_ilimitadas": true, "alunos_ilimitados": true, "gastos_ilimitados": true, "acesso_completo": true, "suporte_dedicado": true, "painel_administrativo": true, "integracao_ia": true, "gestao_franquias": true}'::jsonb,
       '{}'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE plan_type = 'unlimited');