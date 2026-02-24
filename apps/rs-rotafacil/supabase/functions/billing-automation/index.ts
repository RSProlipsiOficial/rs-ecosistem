import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log('🚀 Iniciando Worker de Automação de Cobrança...');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const results = [];

        // 1. Buscar usuários com automação ativa
        const { data: configs, error: configError } = await supabase
            .from('mensalidades_config')
            .select('*')
            .eq('envio_automatico_ativo', true);

        if (configError) throw configError;
        console.log(`📋 ${configs?.length || 0} usuários com automação ativa`);

        for (const config of configs || []) {
            const userId = config.user_id;

            // 2. Buscar instância WhatsApp conectada
            const { data: instances } = await supabase
                .from('whatsapp_instances')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'open')
                .limit(1);

            if (!instances || instances.length === 0) {
                console.log(`⚠️ Usuário ${userId}: sem instância WhatsApp conectada`);
                continue;
            }

            const instance = instances[0];

            // 3. Buscar chaves Mercado Pago
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('mercadopago_access_token, mercadopago_public_key')
                .eq('user_id', userId)
                .maybeSingle();

            if (!profile?.mercadopago_access_token) {
                console.log(`⚠️ Usuário ${userId}: sem chaves Mercado Pago configuradas`);
                continue;
            }

            // 4. Calcular datas de disparo
            const diasAntes = config.dias_antes_vencimento || 3;
            const diasApos = config.dias_apos_vencimento || 5;

            // Buscar pagamentos não pagos do mês atual
            const currentMonth = today.getMonth() + 1;
            const currentYear = today.getFullYear();

            const { data: pagamentos } = await supabase
                .from('pagamentos_mensais')
                .select(`
          *,
          alunos:aluno_id (
            nome_completo,
            whatsapp_responsavel,
            dia_vencimento
          )
        `)
                .eq('user_id', userId)
                .eq('mes', currentMonth)
                .eq('ano', currentYear)
                .eq('status', 'nao_pago');

            for (const pagamento of pagamentos || []) {
                const aluno = Array.isArray(pagamento.alunos) ? pagamento.alunos[0] : pagamento.alunos;
                if (!aluno || !aluno.whatsapp_responsavel) continue;

                const diaVencimento = aluno.dia_vencimento || 10;
                const dataVencimento = new Date(currentYear, currentMonth - 1, diaVencimento);

                const diffDays = Math.floor((dataVencimento.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                let tipoMensagem = null;
                let template = '';

                // Determinar tipo de mensagem
                if (diffDays === diasAntes) {
                    tipoMensagem = 'antes_vencimento';
                    template = config.mensagem_antes_vencimento || '';
                } else if (diffDays === 0) {
                    tipoMensagem = 'no_vencimento';
                    template = config.mensagem_vencimento || '';
                } else if (diffDays < 0 && Math.abs(diffDays) <= diasApos) {
                    tipoMensagem = 'apos_vencimento';
                    template = config.mensagem_apos_vencimento || '';
                }

                if (!tipoMensagem || !template) continue;

                // 5. Gerar PIX via Mercado Pago
                let pixQRCode = pagamento.pix_qr_code;
                if (!pixQRCode) {
                    try {
                        const pixResponse = await supabase.functions.invoke('mercado-pago-pix', {
                            body: {
                                pagamentoId: pagamento.id,
                                userId: userId
                            }
                        });

                        if (pixResponse.data?.qr_code) {
                            pixQRCode = pixResponse.data.qr_code;
                        }
                    } catch (pixError) {
                        console.error(`Erro ao gerar PIX para pagamento ${pagamento.id}:`, pixError);
                    }
                }

                // 6. Personalizar template
                const mensagem = template
                    .replace('{aluno}', aluno.nome_completo)
                    .replace('{valor}', `R$ ${Number(pagamento.valor).toFixed(2)}`)
                    .replace('{dias}', Math.abs(diffDays).toString())
                    .replace('{pix}', pixQRCode || 'Consulte a transportadora');

                // 7. Enviar via Evolution API
                try {
                    const sendResponse = await supabase.functions.invoke('whatsapp-baileys', {
                        body: {
                            action: 'send_message',
                            payload: {
                                user_id: userId,
                                instance_id: instance.id,
                                to_number: aluno.whatsapp_responsavel,
                                context: {
                                    tipo: tipoMensagem,
                                    aluno_nome: aluno.nome_completo,
                                    valor: pagamento.valor,
                                    dias_vencimento: diffDays,
                                    chave_pix: pixQRCode
                                }
                            }
                        }
                    });

                    if (sendResponse.data?.success) {
                        results.push({
                            user_id: userId,
                            aluno: aluno.nome_completo,
                            tipo: tipoMensagem,
                            status: 'sent'
                        });
                        console.log(`✅ Mensagem enviada para ${aluno.nome_completo} (${tipoMensagem})`);
                    }
                } catch (sendError) {
                    console.error(`Erro ao enviar mensagem:`, sendError);
                    results.push({
                        user_id: userId,
                        aluno: aluno.nome_completo,
                        tipo: tipoMensagem,
                        status: 'failed',
                        error: sendError.message
                    });
                }
            }
        }

        return new Response(JSON.stringify({ success: true, results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("❌ Erro no Worker:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
