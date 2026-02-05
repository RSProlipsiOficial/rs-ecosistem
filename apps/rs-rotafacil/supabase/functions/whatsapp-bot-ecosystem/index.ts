import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY')!;
        const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY')!;
        let evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL')!;

        if (!evolutionApiUrl.startsWith('http')) evolutionApiUrl = `https://${evolutionApiUrl}`;

        console.log('--- INICIANDO SCANNER DO ECOSSISTEMA ---');

        // 1. Buscar usuários com faturamento automático ativo
        const { data: activeConfigs, error: configError } = await supabase
            .from('ai_configuration')
            .select('*, user_profiles(*)')
            .eq('ecosystem_billing_active', true);

        if (configError) throw configError;

        console.log(`Encontrados ${activeConfigs?.length || 0} usuários com automação ativa.`);

        const results = [];

        for (const config of activeConfigs || []) {
            const userId = config.user_id;
            const profile = config.user_profiles;

            // 2. Buscar instância WhatsApp conectada para este usuário
            const { data: instance } = await supabase
                .from('whatsapp_instances')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'open')
                .maybeSingle();

            if (!instance) {
                console.log(`Usuário ${userId} não tem instância WhatsApp aberta. Pulando...`);
                continue;
            }

            // 3. Buscar alunos ativos com pagamentos pendentes (Vencendo amanhã ou Hoje ou Atrasados)
            // Para simplificar, focamos em: Vencimento = Amanhã ou Hoje
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const dayToday = today.getDate();
            const dayTomorrow = tomorrow.getDate();
            const currentMonth = today.getMonth() + 1;
            const currentYear = today.getFullYear();

            const { data: pendencias, error: pError } = await supabase
                .from('pagamentos_mensais')
                .select('*, alunos(*)')
                .eq('user_id', userId)
                .eq('status', 'em_aberto')
                .in('mes', [currentMonth, currentMonth - 1]) // Mês atual ou anterior se atrasado
                .filter('data_vencimento', 'lte', tomorrow.toISOString().split('T')[0]);

            if (pError) {
                console.error(`Erro ao buscar pendências para ${userId}:`, pError);
                continue;
            }

            console.log(`Usuário ${userId}: ${pendencias?.length || 0} pendências encontradas.`);

            for (const pg of pendencias || []) {
                try {
                    // Evitar disparos duplicados (verificar se já enviou mensagem de automação hoje para este pagamento)
                    const { count } = await supabase
                        .from('ai_ecosystem_logs')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', userId)
                        .eq('action_type', 'billing_scan')
                        .filter('details->pagamento_id', 'eq', pg.id)
                        .filter('created_at', 'gte', today.toISOString().split('T')[0]);

                    if (count && count > 0) {
                        console.log(`Cobrança já enviada hoje para pagamento ${pg.id}. Pulando...`);
                        continue;
                    }

                    // 4. Gerar PIX via Edge Function existente
                    const { data: pixData, error: pixError } = await supabase.functions.invoke('mercado-pago-pix', {
                        body: { pagamentoId: pg.id }
                    });

                    if (pixError || !pixData?.qr_code) {
                        console.error(`Erro ao gerar PIX para ${pg.id}:`, pixError);
                        continue;
                    }

                    // 5. Buscar Prompt Dinâmico e Contexto
                    const { data: promptTemplate } = await supabase
                        .from('ai_prompts')
                        .select('content')
                        .eq('slug', 'cobranca_proativa')
                        .eq('is_active', true)
                        .maybeSingle();

                    const voiceTone = config.ai_voice_tone || 'profissional e amigável';
                    const customInstr = config.custom_instructions || 'não especificado';

                    const basePrompt = promptTemplate?.content || `Gere uma mensagem profissional de cobrança. Aluno: {aluno}, Valor: {valor}, Vencimento: {vencimento}.`;

                    // Substituir variáveis no prompt
                    const fullPrompt = basePrompt
                        .replace('{aluno}', pg.alunos.nome_completo)
                        .replace('{valor}', `R$ ${pixData.valor_atualizado || pg.valor}`)
                        .replace('{vencimento}', new Date(pg.data_vencimento).toLocaleDateString('pt-BR'))
                        .replace('{tom_voz}', voiceTone)
                        .replace('{instrucoes_custom}', customInstr)
                        .replace('{pix_code}', pixData.qr_code);

                    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${openRouterApiKey}`,
                            'Content-Type': 'application/json',
                            'HTTP-Referer': 'https://rsprolipsi.com.br',
                            'X-Title': 'RS Prolipsi Ecosystem'
                        },
                        body: JSON.stringify({
                            model: 'openai/gpt-4o-mini',
                            messages: [
                                {
                                    role: 'system',
                                    content: `Você é um assistente de IA robusto. Siga estritamente o tom: ${voiceTone}. Instruções do sistema: ${customInstr}`
                                },
                                { role: 'user', content: fullPrompt }
                            ],
                            temperature: 0.7
                        })
                    });

                    const aiData: any = await aiResponse.json();

                    if (!aiData || !aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
                        console.error('Resposta da IA inválida ou incompleta:', aiData);
                        continue;
                    }

                    const messageText = aiData.choices[0].message.content;

                    // 6. Enviar via Evolution API
                    const sendResponse = await fetch(`${evolutionApiUrl}/message/sendText/${instance.instance_name}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'apikey': evolutionApiKey },
                        body: JSON.stringify({
                            number: pg.alunos.whatsapp_responsavel.replace(/\D/g, ''),
                            text: messageText,
                            delay: 1200,
                            linkPreview: true
                        })
                    });

                    if (sendResponse.ok) {
                        // Logar interação detalhada
                        await supabase.from('ai_interaction_logs').insert({
                            user_id: userId,
                            prompt_slug: 'cobranca_proativa',
                            request_payload: { aluno: pg.alunos.nome_completo, pagamento_id: pg.id },
                            response_content: messageText,
                            status: 'success'
                        });

                        await supabase.from('ai_ecosystem_logs').insert({
                            user_id: userId,
                            action_type: 'billing_scan',
                            status: 'success',
                            details: { pagamento_id: pg.id, aluno: pg.alunos.nome_completo }
                        });
                        results.push({ id: pg.id, status: 'sent' });
                    } else {
                        const errorText = await sendResponse.text();
                        throw new Error(errorText);
                    }

                } catch (innerError: any) {
                    console.error(`Erro ao processar cobrança ${pg.id}:`, innerError);
                    results.push({ id: pg.id, status: 'failed', error: innerError.message });
                }
            }

            // Atualizar timestamp do último scan
            await supabase
                .from('ai_configuration')
                .update({ ecosystem_last_scan: new Date().toISOString() })
                .eq('user_id', userId);
        }

        return new Response(JSON.stringify({ success: true, results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Erro no Scanner:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
