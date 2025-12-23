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

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase env" }), { status: 500, headers: corsHeaders });
    }

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const orderPayload = {
      customer_email: body.customerEmail,
      customer_name: body.customerName,
      customer_phone: body.customerPhone,
      customer_cpf: body.customerCpf,
      shipping_address: body.shippingAddress,
      shipping_method: body.shippingMethod,
      subtotal: body.subtotal,
      discount: body.discount,
      shipping_cost: body.shippingCost,
      total: body.total,
      payment_method: body.paymentMethod,
      items: body.items,
      referred_by: body.referredBy,
      status: "processing",
      payment_status: "pending"
    };

    const { data, error } = await admin
      .from("orders")
      .insert(orderPayload)
      .select("id")
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ orderId: data.id }), { headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});

