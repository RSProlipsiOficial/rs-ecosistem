import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookData = await req.json();

    console.log('Webhook recebido do Mercado Pago:', webhookData);

    // Verificar se é um pagamento aprovado
    if (webhookData.type === 'payment' && webhookData.data?.id) {
      const paymentId = webhookData.data.id;

      // Consultar detalhes do pagamento no Mercado Pago
      const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');

      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!paymentResponse.ok) {
        throw new Error('Erro ao consultar pagamento no Mercado Pago');
      }

      const paymentData = await paymentResponse.json();
      console.log('Dados do pagamento:', paymentData);

      // Verificar se o pagamento foi aprovado
      if (paymentData.status === 'approved') {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const externalReference = paymentData.external_reference;

        if (externalReference && externalReference.startsWith('matricula:')) {
          // Pagamento de matrícula via PIX
          const alunoId = externalReference.replace('matricula:', '');

          const { error: updateError } = await supabase
            .from('aluno_pix_charges')
            .update({
              status: 'PAID',
              paid_at: new Date().toISOString(),
              mp_payment_id: paymentData.id.toString()
            })
            .eq('aluno_id', alunoId)
            .eq('status', 'PENDING') // Idempotência: só atualiza se ainda estiver pendente
            .order('created_at', { ascending: false })
            .limit(1);

          if (updateError) {
            console.error('Erro ao atualizar cobrança de matrícula:', updateError);
          } else {
            console.log('Cobrança de matrícula confirmada:', alunoId);

            // ATIVAR O ALUNO NO SISTEMA
            const { error: activeError } = await supabase
              .from('alunos')
              .update({ ativo: true })
              .eq('id', alunoId);

            if (activeError) {
              console.error('Erro ao ativar aluno após pagamento:', activeError);
            } else {
              console.log('Aluno ativado com sucesso:', alunoId);
            }
          }

        } else if (externalReference && externalReference.startsWith('PAG-')) {
          const pagamentoId = externalReference.replace('PAG-', '');

          // 1. Atualizar Mensalidade
          const { error: updateError } = await supabase
            .from('pagamentos_mensais')
            .update({
              status: 'pago',
              data_pagamento: new Date().toISOString().split('T')[0]
            })
            .eq('id', pagamentoId);

          if (updateError) {
            console.error('Erro ao atualizar pagamento mensal:', updateError);
          } else {
            console.log('Pagamento mensal confirmado:', pagamentoId);

            // 2. Sincronizar com o Financeiro (Lancamentos Financeiros)
            const { error: finError } = await supabase
              .from('lancamentos_financeiros')
              .update({
                pagamento_status: 'pago',
                status: 'realizado',
                pago_em: new Date().toISOString()
              })
              .eq('referencia_id', pagamentoId);

            if (finError) console.error('Erro ao sincronizar financeiro:', finError);

            // NOTIFICAR N8N PARA DISPARAR WHATSAPP DE CONFIRMAÇÃO
            const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
            if (n8nWebhookUrl) {
              try {
                await fetch(`${n8nWebhookUrl}/payment-confirmed`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    pagamento_id: pagamentoId,
                    status: 'pago',
                    external_reference: externalReference,
                    payment_data: paymentData
                  })
                });
                console.log('N8N notificado do pagamento:', pagamentoId);
              } catch (n8nError) {
                console.error('Erro ao notificar N8N:', n8nError);
              }
            }
          }
        } else if (externalReference && externalReference.startsWith('SUB-')) {
          const subscriptionId = externalReference.replace('SUB-', '');

          const { error: updateError } = await supabase
            .from('user_subscriptions')
            .update({ status: 'active' })
            .eq('id', subscriptionId);

          if (updateError) {
            console.error('Erro ao atualizar subscription:', updateError);
          } else {
            console.log('Subscription ativada:', subscriptionId);
          }
        } else if (externalReference) {
          // Lógica original para assinaturas (Fallback)
          const subscriptionId = externalReference;

          const { error: updateError } = await supabase
            .from('user_subscriptions')
            .update({ status: 'active' })
            .eq('id', subscriptionId);

          if (updateError) {
            console.error('Erro ao atualizar subscription:', updateError);
          } else {
            console.log('Subscription ativada:', subscriptionId);
          }

          // Buscar dados da subscription para obter o user_id
          const { data: subscription } = await supabase
            .from('user_subscriptions')
            .select('user_id, plan_id, subscription_plans!inner(name, price)')
            .eq('id', subscriptionId)
            .single();

          if (subscription && subscription.subscription_plans) {
            // Se for um plano com créditos de IA ou compra de créditos extra
            const planData = subscription.subscription_plans as any;
            const planId = subscription.plan_id;
            const planName = planData.name;
            const planPrice = planData.price;

            // LÓGICA MINISITE (Sincronização de Plano)
            const minisitePlans: Record<string, string> = {
              'e0a9d0a0-0001-4000-8000-000000000001': 'start',
              'e0a9d0a0-0002-4000-8000-000000000002': 'pro',
              'e0a9d0a0-0003-4000-8000-000000000003': 'agency'
            };

            if (minisitePlans[planId]) {
              const { error: profileError } = await supabase
                .from('minisite_profiles')
                .update({ plan: minisitePlans[planId] })
                .eq('id', subscription.user_id);

              if (profileError) {
                console.error('Erro ao ativar plano MiniSite no perfil:', profileError);
              } else {
                console.log(`Plano MiniSite ${minisitePlans[planId]} ativado para ${subscription.user_id}`);
              }
            }

            // Mapear planos para créditos de IA (Rota Fácil)
            let creditosIA = 0;
            if (planName?.includes('Premium') || planName?.includes('Crescimento')) {
              creditosIA = 500;
            } else if (planName?.includes('Profissional')) {
              creditosIA = 1500;
            } else if (planName?.includes('Ilimitado')) {
              creditosIA = -1;
            }

            // Aplicar créditos de IA se houver
            if (creditosIA !== 0) {
              const currentMonth = new Date().getMonth() + 1;
              const currentYear = new Date().getFullYear();

              const { error: creditsError } = await supabase
                .from('user_ai_credits')
                .upsert({
                  user_id: subscription.user_id,
                  mes: currentMonth,
                  ano: currentYear,
                  limite_mensal: creditosIA,
                  creditos_usados: 0
                }, {
                  onConflict: 'user_id,mes,ano'
                });

              if (creditsError) {
                console.error('Erro ao aplicar créditos IA:', creditsError);
              } else {
                console.log(`Créditos IA aplicados para usuário ${subscription.user_id}: ${creditosIA}`);
              }
            }

            // Registrar na tabela apps_vendidos se não existir
            const { data: existingApp } = await supabase
              .from('apps_vendidos')
              .select('id')
              .eq('id', subscription.user_id) // Usar user_id como referência
              .single();

            if (!existingApp) {
              // Buscar dados do usuário
              const { data: userData } = await supabase.auth.admin.getUserById(subscription.user_id);

              if (userData.user) {
                const { error: appError } = await supabase
                  .from('apps_vendidos')
                  .insert({
                    id: subscription.user_id,
                    nome_cliente: userData.user.user_metadata?.name || 'Cliente',
                    email_cliente: userData.user.email,
                    valor_pago: planPrice,
                    status: 'ativo',
                    observacoes: `Pagamento via Mercado Pago - ${planName}`
                  });

                if (appError) {
                  console.error('Erro ao registrar app vendido:', appError);
                } else {
                  console.log('App vendido registrado para:', userData.user.email);
                }
              }
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});