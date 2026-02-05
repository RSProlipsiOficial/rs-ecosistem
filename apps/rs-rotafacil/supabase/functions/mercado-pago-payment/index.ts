// import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const body = await req.json();
    const { planId, userId, origin = 'https://app.rotafacil.com.br' } = body;
    console.log('Received request body:', body);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch Custom Config for Mercado Pago
    let accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');

    try {
      const { data: config } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'mercado_pago')
        .maybeSingle();

      if (config?.value?.access_token) {
        accessToken = config.value.access_token;
      }
    } catch (e) {
      console.error("Error fetching app_settings:", e);
    }

    if (!accessToken) {
      console.error('ERROR: Mercado Pago access token not configured');
      throw new Error('Mercado Pago access token not configured (Admin Config or Env)');
    }

    console.log('Creating payment preference for:', { planId, userId });

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

    // Criar ou atualizar assinatura pendente
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan_id: plan.id,
        status: 'trial',
        payment_method: 'mercadopago',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (subError) {
      throw new Error(`Failed to create/update subscription: ${subError.message}`);
    }

    const subscriptionId = subscription.id;

    const preference = {
      items: [
        {
          id: plan.id,
          title: `RS Prólipsi - ${plan.name}`,
          currency_id: 'BRL',
          quantity: 1,
          unit_price: Number(plan.price),
        },
      ],
      back_urls: {
        success: origin.includes('minisite') ? `${origin}/?payment=success` : `${origin}/upgrade?success=true`,
        failure: origin.includes('minisite') ? `${origin}/?payment=error` : `${origin}/upgrade?error=payment_failed`,
        pending: origin.includes('minisite') ? `${origin}/?payment=pending` : `${origin}/upgrade?status=pending`,
      },
      external_reference: subscriptionId,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercado-pago-webhook`,
      auto_return: 'approved'
    };

    console.log('Creating preference with Mercado Pago API');

    // Log Preference Payload to DB for debugging
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      await supabase.from('debug_logs').insert({
        message: 'Mercado Pago Preference Payload',
        details: { preference }
      });
    } catch (_) { }

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
      // Return 400 with the upstream error
      throw new Error(`MP Error: ${errorText}`);
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
    console.error('Function catch error:', error);

    // LOG TO DB
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      await supabase.from('debug_logs').insert({
        message: 'Mercado Pago Payment Error',
        details: { error: error instanceof Error ? error.message : error }
      });
    } catch (logError) {
      console.error('Failed to log to DB:', logError);
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno', details: error }),
      {
        status: 400, // Returning 400 to allow frontend to read the body
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});