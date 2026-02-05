// Script temporário para deploy dos planos de assinatura
// Execute: npx tsx deploy-plans.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnyskbygulcqoocddyfg.supabase.co';
// IMPORTANTE: Use a service_role key das suas credenciais
const supabaseServiceKey = 'SEU_SERVICE_ROLE_KEY_AQUI';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function deployPlans() {
    console.log('🚀 Iniciando deploy dos planos de assinatura...\n');

    try {
        // 1. Desativar planos antigos
        console.log('1️⃣ Desativando planos antigos...');
        const { error: deactivateError } = await supabase
            .from('subscription_plans')
            .update({ active: false })
            .eq('active', true);

        if (deactivateError) throw deactivateError;
        console.log('✅ Planos antigos desativados\n');

        // 2. Inserir os 8 novos planos
        const plans = [
            {
                name: 'Grátis',
                description: '7 dias de acesso total, depois limitado a 1 van e 15 alunos',
                price: 0.00,
                plan_type: 'free',
                features: ['7 dias de acesso total', 'Assistente RS-IA básico', 'Suporte via WhatsApp', '1 Van (limitado após trial)', '15 alunos (limitado após trial)', '10 gastos mensais'],
                limitations: {
                    max_vans: 1,
                    max_alunos: 15,
                    max_expenses: 10,
                    trial_days: 7,
                    ai_assistant_included: true,
                    ai_assistant_mode: 'basic',
                    financial_module: 'basic',
                    education_module: 'limited',
                    export_advanced: false,
                    multiuser: false
                },
                active: true
            },
            {
                name: 'Inicial',
                description: 'Ideal para começar seu negócio de transporte escolar',
                price: 14.90,
                plan_type: 'inicial',
                features: ['1 Van', 'Até 60 alunos', 'Financeiro completo', 'Controle de ganhos e gastos', 'Planilha integrada', 'Educação financeira básica', 'Assistente RS-IA padrão', 'WhatsApp básico (cobrança simples)'],
                limitations: {
                    max_vans: 1,
                    max_alunos: 60,
                    max_expenses: null,
                    ai_assistant_included: true,
                    ai_assistant_mode: 'standard',
                    financial_module: 'complete',
                    education_module: 'basic',
                    whatsapp_integration: 'basic',
                    multiuser: false
                },
                active: true
            },
            {
                name: 'Crescimento',
                description: 'Para quem está expandindo e precisa de mais controle',
                price: 29.90,
                plan_type: 'crescimento',
                features: ['2 Vans', 'Até 150 alunos', 'Relatórios por van', 'Comparativo mensal', 'Visão de lucro por rota', 'Educação financeira intermediária', 'Assistente RS-IA padrão', 'WhatsApp integrado'],
                limitations: {
                    max_vans: 2,
                    max_alunos: 150,
                    max_expenses: null,
                    ai_assistant_included: true,
                    ai_assistant_mode: 'standard',
                    financial_module: 'complete',
                    education_module: 'intermediate',
                    reports_by_van: true,
                    monthly_comparison: true,
                    multiuser: false
                },
                active: true
            },
            {
                name: 'Profissional',
                description: 'Gestão completa para operações profissionais',
                price: 139.90,
                plan_type: 'profissional',
                features: ['5 Vans', 'Até 800 alunos', 'Gestão financeira avançada', 'Exportar dados', 'Histórico mensal/anual', 'Educação financeira completa', 'Assistente RS-IA com relatórios', 'Multiusuário limitado', 'Suporte prioritário'],
                limitations: {
                    max_vans: 5,
                    max_alunos: 800,
                    max_expenses: null,
                    ai_assistant_included: true,
                    ai_assistant_mode: 'advanced',
                    financial_module: 'advanced',
                    education_module: 'complete',
                    export_data: true,
                    historical_data: true,
                    multiuser: 'limited',
                    priority_support: false
                },
                active: true
            },
            {
                name: 'Empresarial',
                description: 'Solução empresarial para grandes operações',
                price: 597.00,
                plan_type: 'empresarial',
                features: ['50 Vans', 'Até 6.500 alunos', 'Multiusuário completo', 'Relatórios consolidados', 'Planejamento financeiro', 'Simulação de crescimento', 'IA ativa para análise financeira', 'Suporte prioritário', 'Treinamento incluído'],
                limitations: {
                    max_vans: 50,
                    max_alunos: 6500,
                    max_expenses: null,
                    ai_assistant_included: true,
                    ai_assistant_mode: 'advanced',
                    financial_module: 'advanced',
                    education_module: 'complete',
                    multiuser: 'complete',
                    consolidated_reports: true,
                    financial_planning: true,
                    growth_simulation: true,
                    priority_support: true
                },
                active: true
            },
            {
                name: 'Enterprise',
                description: 'Infraestrutura reforçada para grandes corporações',
                price: 1497.00,
                plan_type: 'enterprise',
                features: ['150 Vans', 'Até 18.000 alunos', 'IA avançada', 'Relatórios estratégicos', 'Infraestrutura reforçada', 'Atendimento prioritário', 'Financeiro corporativo', 'SLA garantido', 'Gerente de conta dedicado'],
                limitations: {
                    max_vans: 150,
                    max_alunos: 18000,
                    max_expenses: null,
                    ai_assistant_included: true,
                    ai_assistant_mode: 'enterprise',
                    financial_module: 'corporate',
                    education_module: 'complete',
                    multiuser: 'complete',
                    priority_support: true,
                    strategic_reports: true,
                    reinforced_infrastructure: true,
                    sla_guaranteed: true
                },
                active: true
            },
            {
                name: 'Ilimitado',
                description: 'Recursos ilimitados com infraestrutura dedicada - Sob consulta',
                price: null,
                plan_type: 'unlimited',
                features: ['Vans ilimitadas', 'Alunos ilimitados', 'Infra dedicada', 'SLA personalizado', 'Contrato específico', 'IA sem limites', 'Suporte VIP 24/7', 'Customizações sob medida'],
                limitations: {
                    max_vans: null,
                    max_alunos: null,
                    max_expenses: null,
                    ai_assistant_included: true,
                    ai_assistant_mode: 'unlimited',
                    dedicated_infrastructure: true,
                    custom_sla: true,
                    vip_support: true,
                    manual_activation: true,
                    contact_sales: true
                },
                active: true
            },
            {
                name: 'Personalizado',
                description: 'Plano customizado para necessidades específicas',
                price: null,
                plan_type: 'custom',
                features: ['Limites personalizados', 'Módulos sob medida', 'Contrato específico', 'Ajuste fino de recursos', 'Suporte dedicado'],
                limitations: {
                    customizable: true,
                    manual_activation: true,
                    contact_sales: true
                },
                active: true
            }
        ];

        console.log('2️⃣ Inserindo 8 novos planos...');
        for (const plan of plans) {
            console.log(`   📦 Criando plano: ${plan.name}...`);
            const { error } = await supabase
                .from('subscription_plans')
                .insert([plan]);

            if (error) {
                console.error(`   ❌ Erro ao criar ${plan.name}:`, error);
                throw error;
            }
            console.log(`   ✅ ${plan.name} criado com sucesso`);
        }

        console.log('\n✅ Deploy concluído com sucesso!');
        console.log('\n📊 Verificando planos ativos...');

        const { data: activePlans, error: fetchError } = await supabase
            .from('subscription_plans')
            .select('name, plan_type, price')
            .eq('active', true)
            .order('price', { ascending: true, nullsFirst: false });

        if (fetchError) throw fetchError;

        console.log('\n🎯 Planos ativos:');
        activePlans?.forEach((plan, index) => {
            const priceStr = plan.price === null ? 'Sob consulta' : `R$ ${plan.price.toFixed(2)}`;
            console.log(`   ${index + 1}. ${plan.name} (${plan.plan_type}) - ${priceStr}`);
        });

        console.log('\n🚀 Sistema de planos está pronto para uso!');

    } catch (error) {
        console.error('\n❌ Erro durante o deploy:', error);
        process.exit(1);
    }
}

deployPlans();
