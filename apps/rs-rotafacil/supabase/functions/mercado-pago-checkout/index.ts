import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function calculateLateFee(dueDateStr: string, originalValue: number, settings: any, diaVencimentoAluno?: number) {
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
        const multa = Number(settings?.juros_valor_multa) || 10;
        const jurosDia = Number(settings?.juros_valor_dia) || 2;
        fee = multa + diffDays * jurosDia;
    } else {
        const multaPerc = Number(settings?.juros_percentual_multa) || 2;
        const jurosMesPerc = Number(settings?.juros_percentual_mes) || 1;
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
        const { pagamentoId, origin: bodyOrigin } = await req.json();

        if (!pagamentoId) {
            return new Response(JSON.stringify({ success: false, error: 'ID nao fornecido.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const origin = bodyOrigin || req.headers.get('origin') || 'https://rs-rotafacil.vercel.app';
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        console.log('--- BUSCA UNIVERSAL (CHECKOUT) --- ID:', pagamentoId);

        // 1. Busca Universal
        let { data: record } = await supabase.from('pagamentos_mensais').select('id, valor, user_id, aluno_id, data_vencimento').eq('id', pagamentoId).maybeSingle();
        let tableName = 'pagamentos_mensais';
        let dueDate = record?.data_vencimento;

        if (!record) {
            const { data: lanc } = await supabase.from('lancamentos_financeiros').select('id, valor, user_id, aluno_id, data_evento').eq('id', pagamentoId).maybeSingle();
            if (lanc) {
                record = lanc;
                tableName = 'lancamentos_financeiros';
                dueDate = lanc.data_evento;
            }
        }

        if (!record) {
            return new Response(JSON.stringify({ success: false, error: 'Cobranca nao encontrada.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 2. Dados do Aluno e Token + Configurações de Juros
        const { data: aluno } = await supabase.from('alunos').select('nome_completo, email, cpf, dia_vencimento').eq('id', record.aluno_id).maybeSingle();
        const { data: profile } = await supabase.from('user_profiles').select(`
            mercadopago_access_token,
            juros_tipo,
            juros_valor_multa,
            juros_valor_dia,
            juros_percentual_multa,
            juros_percentual_mes
        `).eq('user_id', record.user_id).maybeSingle();

        const accessToken = profile?.mercadopago_access_token || Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');

        if (!accessToken) throw new Error('Configuracao MercadoPago ausente.');

        const { total, fee } = calculateLateFee(dueDate, record.valor, profile, aluno?.dia_vencimento);
        const nome = aluno?.nome_completo || 'Cliente RotaFacil';
        const email = aluno?.email || 'cliente@exemplo.com';

        // 3. Criar Preferencia no Mercado Pago
        const preferenceBody = {
            items: [
                {
                    id: record.id,
                    title: `Pagamento: ${nome}` + (fee > 0 ? ' (Inclui multa de atraso)' : ''),
                    quantity: 1,
                    unit_price: Number(total.toFixed(2)),
                    currency_id: 'BRL'
                }
            ],
            payer: {
                name: nome.split(' ')[0],
                surname: nome.split(' ').slice(1).join(' ') || 'RotaFacil',
                email: email,
                identification: aluno?.cpf ? {
                    type: 'CPF',
                    number: aluno.cpf.replace(/\D/g, '')
                } : undefined
            },
            external_reference: `${tableName}:${record.id}`,
            back_urls: {
                success: `${origin}/financeiro?status=success`,
                failure: `${origin}/financeiro?status=failure`,
                pending: `${origin}/financeiro?status=pending`
            },
            notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercado-pago-webhook`
        };

        const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(preferenceBody),
        });

        if (!mpResponse.ok) {
            const errText = await mpResponse.text();
            console.error('Erro MP Checkout:', errText);
            const errJson = JSON.parse(errText);
            return new Response(JSON.stringify({ success: false, error: errJson.message || 'Erro no Checkout' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const mpData = await mpResponse.json();
        return new Response(JSON.stringify({ success: true, init_point: mpData.init_point }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
