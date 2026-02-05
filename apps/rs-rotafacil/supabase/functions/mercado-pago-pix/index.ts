import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function calculateLateFee(dueDateStr: string, originalValue: number, settings: any, diaVencimentoAluno?: number) {
    // Ajuste para fuso horário de Brasília (UTC-3)
    const now = new Date();
    const today = new Date(now.getTime() - (3 * 60 * 60 * 1000));
    today.setUTCHours(0, 0, 0, 0);

    let due: Date;

    // Priorizar dia_vencimento do aluno
    if (diaVencimentoAluno) {
        const mesAtual = today.getUTCMonth();
        const anoAtual = today.getUTCFullYear();

        // Criar data de vencimento do mês atual
        due = new Date(Date.UTC(anoAtual, mesAtual, diaVencimentoAluno, 0, 0, 0));

        // Se o vencimento ainda não chegou neste mês, usar o mês anterior
        if (due > today) {
            due = new Date(Date.UTC(anoAtual, mesAtual - 1, diaVencimentoAluno, 0, 0, 0));
        }
    } else if (dueDateStr) {
        // Fallback: usar dueDateStr
        due = new Date(dueDateStr);
        due.setUTCHours(0, 0, 0, 0);
    } else {
        return { fee: 0, total: originalValue, daysLate: 0 };
    }

    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { fee: 0, total: originalValue, daysLate: 0 };

    let fee = 0;
    const type = settings?.juros_tipo || 'valor';

    if (type === 'valor') {
        // Regra: Multa fixa + Valor por dia de atraso
        const multa = Number(settings?.juros_valor_multa) || 10;
        const jurosDia = Number(settings?.juros_valor_dia) || 2;
        fee = multa + diffDays * jurosDia;
    } else {
        // Regra: Multa % + Juros % ao mês
        const multaPerc = Number(settings?.juros_percentual_multa) || 2; // 2% multa
        const jurosMesPerc = Number(settings?.juros_percentual_mes) || 1; // 1% ao mês

        const valorMulta = (originalValue * multaPerc) / 100;
        const taxaDiaria = (jurosMesPerc / 30) / 100;
        const valorJuros = originalValue * taxaDiaria * diffDays;

        fee = valorMulta + valorJuros;
    }

    return { fee, total: originalValue + fee, daysLate: diffDays };
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { pagamentoId, amount, userId, description, type } = await req.json();

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        let record: any = null;
        let tableName = 'payment_history';
        let dueDate: string | null = null;
        let finalAmount = amount;
        let targetUserId = userId;
        let finalDescription = description;
        let customerData: any = { nome: 'Cliente RotaFacil', email: 'cliente@exemplo.com', cpf: null };

        console.log('--- GERADOR DE PIX --- TYPE:', type || 'mensalidade');

        if (type === 'app_subscription') {
            // Fluxo de Assinatura de App (Admin cobrando Dono)
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('nome_completo, email, cpf')
                .eq('user_id', targetUserId)
                .maybeSingle();

            if (profile) {
                customerData = {
                    nome: profile.nome_completo || 'Proprietário App',
                    email: profile.email || 'proprietario@rotafacil.com',
                    cpf: profile.cpf
                };
            }

            // Criar registro inicial no histórico de pagamento se não houver um
            const { data: history, error: histError } = await supabase
                .from('payment_history')
                .insert({
                    user_id: targetUserId,
                    amount: finalAmount,
                    payment_method: 'mercadopago_pix',
                    payment_status: 'pending',
                    external_reference: finalDescription
                })
                .select()
                .single();

            if (histError) throw histError;
            record = history;
            tableName = 'payment_history';

        } else {
            // Fluxo padrão (Mensalidade de Aluno)
            if (!pagamentoId) {
                return new Response(JSON.stringify({ success: false, error: 'ID nao fornecido.' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            // 1. Tentar buscar em pagamentos_mensais primeiro
            let { data: rec, error: recError } = await supabase
                .from('pagamentos_mensais')
                .select('id, valor, user_id, aluno_id, data_vencimento')
                .eq('id', pagamentoId)
                .maybeSingle();

            tableName = 'pagamentos_mensais';
            record = rec;

            // 2. Se não achou na mensalidade, buscar no lancamentos_financeiros
            if (!record) {
                const { data: lanc } = await supabase
                    .from('lancamentos_financeiros')
                    .select('id, valor, user_id, aluno_id, data_evento')
                    .eq('id', pagamentoId)
                    .maybeSingle();

                if (lanc) {
                    record = lanc;
                    tableName = 'lancamentos_financeiros';
                }
            }

            if (!record) {
                return new Response(JSON.stringify({ success: false, error: 'Cobranca nao encontrada.' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            dueDate = tableName === 'pagamentos_mensais' ? record.data_vencimento : record.data_evento;
            targetUserId = record.user_id;

            // Buscar dados do aluno
            const { data: aluno } = await supabase
                .from('alunos')
                .select('nome_completo, email, cpf, dia_vencimento')
                .eq('id', record.aluno_id)
                .maybeSingle();

            if (aluno) {
                customerData = {
                    nome: aluno.nome_completo,
                    email: aluno.email,
                    cpf: aluno.cpf
                };
            }

            // Buscar configurações de juros do transportador
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('juros_tipo, juros_valor_multa, juros_valor_dia, juros_percentual_multa, juros_percentual_mes')
                .eq('user_id', record.user_id)
                .maybeSingle();

            const { total, fee } = calculateLateFee(dueDate, record.valor, profile, aluno?.dia_vencimento);
            finalAmount = total;
            finalDescription = `Pagamento: ${customerData.nome}` + (fee > 0 ? ' (Inclui multa de atraso)' : '');
        }

        // 3. Token do receptor (ou Global)
        const { data: receiverProfile } = await supabase
            .from('user_profiles')
            .select('mercadopago_access_token')
            .eq('user_id', type === 'app_subscription' ? Deno.env.get('ADMIN_USER_ID') : targetUserId)
            .maybeSingle();

        const accessToken = receiverProfile?.mercadopago_access_token || Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
        if (!accessToken) throw new Error('Credenciais de pagamento nao configuradas.');

        // 4. Payload Mercado Pago
        const mpBody = {
            transaction_amount: Number(finalAmount.toFixed(2)),
            description: finalDescription,
            payment_method_id: 'pix',
            notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercado-pago-webhook`,
            payer: {
                email: customerData.email || 'cliente@rotafacil.com',
                first_name: customerData.nome.split(' ')[0],
                last_name: customerData.nome.split(' ').slice(1).join(' ') || 'RotaFacil',
                identification: customerData.cpf ? {
                    type: 'CPF',
                    number: customerData.cpf.replace(/\D/g, '')
                } : undefined
            },
            external_reference: type === 'app_subscription' ? `SUB-${record.id}` : `PAG-${record.id}`
        };

        const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': `pix-${record.id}-${Date.now()}`
            },
            body: JSON.stringify(mpBody),
        });

        if (!mpResponse.ok) {
            const errText = await mpResponse.text();
            console.error('Erro MP API:', errText);
            return new Response(JSON.stringify({ success: false, error: 'Erro na API do Mercado Pago' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const mpData = await mpResponse.json();

        // 5. Salvar dados de volta (Status permanece pendente até o webhook confirmar)
        const pixUpdate = {
            pix_id: mpData.id.toString(),
            pix_qr_code: mpData.point_of_interaction?.transaction_data?.qr_code,
            pix_qr_code_base64: mpData.point_of_interaction?.transaction_data?.qr_code_base64,
            pix_expiration: mpData.date_of_expiration,
            external_payment_id: mpData.id.toString(),
            pagamento_status: 'pendente'
        };

        await supabase.from(tableName).update(pixUpdate).eq('id', record.id);

        if (tableName === 'pagamentos_mensais') {
            await supabase.from('lancamentos_financeiros').update(pixUpdate).eq('referencia_id', record.id);
        }

        return new Response(
            JSON.stringify({
                success: true,
                qr_code: pixUpdate.pix_qr_code,
                qr_code_base64: pixUpdate.pix_qr_code_base64,
                ticket_url: mpData.point_of_interaction?.transaction_data?.ticket_url,
                mp_id: mpData.id
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Erro na funcao:', error.message);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
