import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        // Use Service Role Key to bypass RLS for configuration reading
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Fetch AI Configuration (Cached if possible, but for now direct query)
        const { data: config, error: configError } = await supabase
            .from('ai_configuration')
            .select('*')
            .limit(1)
            .single();

        if (configError || !config) {
            console.error('Erro ao carregar configuração de IA:', configError);
            return new Response(JSON.stringify({ error: 'Configuration missing' }), { status: 500 });
        }

        // --- GET Request: Webhook Verification ---
        if (req.method === 'GET') {
            const url = new URL(req.url);
            const mode = url.searchParams.get('hub.mode');
            const token = url.searchParams.get('hub.verify_token');
            const challenge = url.searchParams.get('hub.challenge');

            if (mode === 'subscribe' && token === config.whatsapp_verify_token) {
                console.log('Webhook verified successfully!');
                return new Response(challenge, { headers: { 'Content-Type': 'text/plain' } });
            } else {
                return new Response('Verification failed', { status: 403 });
            }
        }

        // --- POST Request: Incoming Messages ---
        if (req.method === 'POST') {
            if (!config.is_active) {
                console.log('Chatbot is inactive. Ignoring message.');
                return new Response(JSON.stringify({ status: 'ignored (inactive)' }), { status: 200 });
            }

            const body = await req.json();

            // WhatsApp payload structure
            // entry[].changes[].value.messages[]
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;
            const message = value?.messages?.[0];

            if (message) {
                const from = message.from; // Phone number
                const messageBody = message.text?.body;
                const messageType = message.type;

                if (messageType === 'text') {
                    console.log(`Received message from ${from}: ${messageBody}`);

                    // 1. Call OpenRouter/LLM
                    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
                    if (!openRouterApiKey) {
                        console.error('OPENROUTER_API_KEY not set');
                        return new Response(JSON.stringify({ error: 'Server config error' }), { status: 500 });
                    }

                    const llmResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${openRouterApiKey}`,
                            'Content-Type': 'application/json',
                            'HTTP-Referer': 'https://rotafacil.app',
                            'X-Title': 'RotaFacil WhatsApp Bot'
                        },
                        body: JSON.stringify({
                            model: 'openai/gpt-3.5-turbo', // Or 'anthropic/claude-3-haiku' for speed/cost
                            messages: [
                                { role: 'system', content: config.system_prompt || 'Você é um assistente útil.' },
                                { role: 'user', content: messageBody }
                            ],
                            temperature: 0.7,
                        }),
                    });

                    const llmData = await llmResponse.json();
                    const aiText = llmData.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua mensagem.";

                    // 2. Send response back to WhatsApp
                    const phoneId = config.whatsapp_phone_id;
                    const accessToken = config.whatsapp_access_token;

                    if (!phoneId || !accessToken) {
                        console.error('WhatsApp credentials missing in DB');
                        return new Response(JSON.stringify({ error: 'Credentials missing' }), { status: 500 });
                    }

                    const whatsappResponse = await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            messaging_product: 'whatsapp',
                            to: from,
                            text: { body: aiText },
                            // Optional: Reply to specific message
                            // context: { message_id: message.id } 
                        }),
                    });

                    if (!whatsappResponse.ok) {
                        const err = await whatsappResponse.text();
                        console.error('Error sending WhatsApp message:', err);
                    } else {
                        console.log('Reply sent successfully');
                        // 3. Debit Credit for the response
                        // Assuming we can identify the user.
                        // Ideally the config belongs to a user.
                        if (config.user_id) {
                            await supabase.rpc('consume_ai_credit', { user_uuid: config.user_id, amount: 1 });
                        }
                    }

                    // Optional: Save to DB (chat_messages) if you want to track history
                }
            }

            return new Response(JSON.stringify({ status: 'success' }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response('Method not allowed', { status: 405 });

    } catch (error) {
        console.error('Unexpected error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});
