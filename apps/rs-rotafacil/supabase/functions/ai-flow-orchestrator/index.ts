import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { prompt } = await req.json()
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ""
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""
        const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY')

        const supabase = createClient(supabaseUrl, supabaseKey)

        // 1. Log da solicitação
        const { data: logData, error: logError } = await supabase
            .from('ai_automation_logs')
            .insert([{ prompt }])
            .select()
            .single()

        // 2. Processamento com OpenRouter
        const systemPrompt = `
      Você é o "Cérebro IA" do sistema RS Rota Fácil.
      Sua função é ajudar o administrador a criar automações entre o WhatsApp e o sistema n8n.
      
      Regras:
      1. Se o usuário pedir um fluxo, retorne uma explicação curta e um objeto JSON no formato do n8n (v1).
      2. Foque em fluxos de: Cobrança via WhatsApp, Avisos de Novos Alunos, Webhooks de Pagamento PIX e Festividades.
      3. Seja profissional, proativo e técnico.
      
      Estrutura de resposta esperada (JSON):
      {
        "response": "Texto amigável explicando o que vou fazer",
        "type": "workflow",
        "data": { ... objeto n8n ... }
      }
    `;

        const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openRouterApiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: prompt }
                ]
            })
        })

        const aiData = await aiRes.json()
        const rawContent = aiData.choices[0].message.content

        // Tentar parsear o JSON da IA
        let finalResponse;
        try {
            finalResponse = JSON.parse(rawContent)
        } catch {
            finalResponse = {
                response: rawContent,
                type: 'text'
            }
        }

        // 3. Update log
        if (logData) {
            await supabase
                .from('ai_automation_logs')
                .update({
                    generated_workflow: finalResponse.data,
                    status: 'success'
                })
                .eq('id', logData.id)
        }

        return new Response(JSON.stringify(finalResponse), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
