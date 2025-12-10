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

        const subscriptionId = paymentData.external_reference;
        
        if (subscriptionId) {
          // Atualizar status da subscription
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
            const planName = planData.name;
            const planPrice = planData.price;
            
            // Mapear planos para créditos de IA
            let creditosIA = 0;
            if (planName?.includes('Premium')) {
              creditosIA = 500; // Plano Premium ganha 500 créditos
            } else if (planName?.includes('Profissional')) {
              creditosIA = 1500; // Plano Profissional ganha 1500 créditos
            } else if (planName?.includes('Ilimitado')) {
              creditosIA = -1; // Plano Ilimitado = créditos ilimitados
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