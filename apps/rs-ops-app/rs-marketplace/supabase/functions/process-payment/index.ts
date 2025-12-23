// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { amount, method, cardData, orderId } = body;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase env" }), { status: 500, headers: corsHeaders });
    }
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const mpToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    if (!mpToken) {
      return new Response(JSON.stringify({ error: "Gateway token not configured" }), { status: 400, headers: corsHeaders });
    }

    let paymentPayload: Record<string, unknown> = {
      transaction_amount: amount,
      description: "Compra RS Prólipsi Marketplace",
      payment_method_id: method === "PIX" ? "pix" : method === "BOLETO" ? "bolbradesco" : "visa",
      payer: { email: "customer@email.com" }
    };

    if (method === "CREDIT_CARD" && cardData) {
      paymentPayload = {
        ...paymentPayload,
        token: cardData.number,
        installments: cardData.installments || 1,
        payer: {
          email: "customer@email.com",
          identification: { type: "CPF", number: "12345678900" }
        }
      };
    }

    const res = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mpToken}`
      },
      body: JSON.stringify(paymentPayload)
    });

    const data = await res.json();

    const status = data.status || "pending";
    let update: Record<string, unknown> = {};
    if (status === "approved" && orderId) {
      update = {
        payment_status: "approved",
        status: "paid",
        payment_id: String(data.id || ""),
        payment_date: new Date().toISOString()
      };
      await admin.from("orders").update(update).eq("id", orderId);
    }

    const result = {
      id: data.id,
      status,
      message: status === "approved" ? "Pagamento aprovado." : "Pagamento pendente.",
      pixCode: data?.point_of_interaction?.transaction_data?.qr_code || undefined,
      boletoUrl: data?.transaction_details?.external_resource_url || undefined
    };

    return new Response(JSON.stringify(result), { headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});

