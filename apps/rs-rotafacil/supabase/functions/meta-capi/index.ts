
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function hash(string: string) {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((bytes) => bytes.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: corsHeaders
        });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { event_name, event_id, user_data, custom_data, url, test_event_code } = await req.json();

        // 1. Get Pixel Config
        const { data: settings } = await supabaseClient
            .from('app_settings')
            .select('value')
            .eq('key', 'pixels_config')
            .single();

        if (!settings?.value) {
            throw new Error('Pixel configuration not found');
        }

        const config = settings.value;
        const pixelId = config.facebook_pixel_id;
        const token = config.facebook_conversions_api_token;

        if (!config.facebook_pixel_enabled || !pixelId || !token) {
            return new Response(JSON.stringify({ message: "Pixel/CAPI disabled or missing config" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200, // Return 200 to avoid client errors, just log it
            });
        }

        // 2. Prepare User Data (Hash PII)
        const hashedUserData: any = {};
        if (user_data) {
            if (user_data.email) hashedUserData.em = await hash(user_data.email.toLowerCase().trim());
            if (user_data.phone) hashedUserData.ph = await hash(user_data.phone.replace(/\D/g, ''));
            // Add other fields if needed (fn, ln, ct, st, zp, country)
            if (user_data.first_name) hashedUserData.fn = await hash(user_data.first_name.toLowerCase().trim());
            if (user_data.last_name) hashedUserData.ln = await hash(user_data.last_name.toLowerCase().trim());
            // IP and User Agent are automatically handled if passed, currently handled by client side mostly but server side needs them
            // We can get client_ip from headers if forwarded, or pass it from client
            // For now, let's assume client sends minimal PII
        }

        // Add Client IP and User Agent if available from request headers
        // Note: In Edge Functions, client IP might be in 'x-forwarded-for' or 'cf-connecting-ip'
        const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('cf-connecting-ip');
        const userAgent = req.headers.get('user-agent');

        if (clientIp) hashedUserData.client_ip_address = clientIp;
        if (userAgent) hashedUserData.client_user_agent = userAgent;

        // 3. Construct Payload
        const currentTimestamp = Math.floor(Date.now() / 1000);

        const eventPayload = {
            data: [
                {
                    event_name: event_name,
                    event_time: currentTimestamp,
                    event_source_url: url,
                    event_id: event_id,
                    action_source: "website",
                    user_data: hashedUserData,
                    custom_data: customData,
                },
            ],
            ...(test_event_code ? { test_event_code } : {}),
        };

        // 4. Send to Meta
        console.log(`Sending ${event_name} to Meta CAPI... Payload:`, JSON.stringify(eventPayload));

        const metaResponse = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventPayload),
        });

        const metaResult = await metaResponse.json();

        if (!metaResponse.ok) {
            console.error('Meta API Error Response:', JSON.stringify(metaResult));
        }

        // 5. Log to DB
        const status = metaResponse.ok ? 'success' : 'failed';

        await supabaseClient.from('tracking_logs').insert({
            event_name,
            event_id,
            status,
            payload: eventPayload,
            response: metaResult,
            pixel_id: pixelId
        });

        return new Response(JSON.stringify(metaResult), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: metaResponse.status,
        });

    } catch (error: any) {
        console.error('CAPI Internal Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
