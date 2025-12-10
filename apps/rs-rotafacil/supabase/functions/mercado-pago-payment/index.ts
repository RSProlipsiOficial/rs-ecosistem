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
    const { planId, userId, origin } = await req.json();
    const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    
    if (!accessToken) {
      throw new Error('Mercado Pago access token not configured');
    }

    console.log('Creating payment preference for:', { planId, userId });

    // Criar subscription no Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validação básica de entrada
    const uuidRegex = /^[0-9a-fA-F-]{36}$/;
    if (!uuidRegex.test(userId) || !uuidRegex.test(planId)) {
      throw new Error('Parâmetros inválidos');
    }

    // Buscar dados do plano
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('id,name,price,plan_type')
      .eq('id', planId)
      .maybeSingle();

    if (planError || !plan) {
      throw new Error('Plano não encontrado');
    }

    // Criar assinatura pendente
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_id: plan.id,
        status: 'trial',
        payment_method: 'mercadopago'
      })
      .select()
      .single();

    if (subError) {
      throw new Error(`Failed to create subscription: ${subError.message}`);
    }

    const subscriptionId = subscription.id;

    const preference = {
      items: [
        {
          id: plan.id,
          title: `RotaFácil - ${plan.name}`,
          currency_id: 'BRL',
          quantity: 1,
          unit_price: Number(plan.price),
        },
      ],
      back_urls: {
        success: `${origin}/upgrade?success=true`,
        failure: `${origin}/upgrade?error=payment_failed`,
        pending: `${origin}/upgrade?status=pending`,
      },
      auto_return: 'approved',
      external_reference: subscriptionId,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercado-pago-webhook`,
    };

    console.log('Creating preference with Mercado Pago API');

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error('Mercado Pago API error:', errorText);
      throw new Error(`Mercado Pago API error: ${mpResponse.status} - ${errorText}`);
    }

    const preferenceData = await mpResponse.json();
    console.log('Preference created successfully:', preferenceData.id);

    return new Response(
      JSON.stringify({
        init_point: preferenceData.init_point,
        preference_id: preferenceData.id,
        subscription_id: subscriptionId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in mercado-pago-payment function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});