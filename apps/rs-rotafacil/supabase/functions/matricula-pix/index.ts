import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
        const { aluno_id, tenant_id, amount } = await req.json();

        if (!aluno_id || !tenant_id) {
            return new Response(JSON.stringify({
                success: false,
                error: 'aluno_id e tenant_id são obrigatórios'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        console.log('--- GERANDO PIX MATRÍCULA ---');
        console.log('Aluno ID:', aluno_id);
        console.log('Tenant ID:', tenant_id);

        // 1. Buscar dados do aluno
        const { data: aluno } = await supabase
            .from('alunos')
            .select('nome_completo, email, cpf, nome_responsavel, valor_mensalidade')
            .eq('id', aluno_id)
            .maybeSingle();

        if (!aluno) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Aluno não encontrado'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 2. Buscar token do Mercado Pago do tenant
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('mercadopago_access_token, pix_key, pix_type, nome_completo')
            .eq('user_id', tenant_id)
            .maybeSingle();

        const accessToken = profile?.mercadopago_access_token;

        // Se não tem token do MP, gerar PIX estático com a chave
        if (!accessToken) {
            console.log('Token MP não encontrado, usando PIX estático');

            if (!profile?.pix_key) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'PIX não configurado pelo transportador',
                    pix_configured: false
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            // Gerar brcode estático (apenas a chave)
            const valorFinal = amount || aluno.valor_mensalidade || 0;

            // Salvar no banco
            const { data: charge, error: chargeError } = await supabase
                .from('aluno_pix_charges')
                .insert({
                    aluno_id,
                    tenant_id,
                    amount: valorFinal,
                    brcode: profile.pix_key,
                    status: 'PENDING',
                    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                })
                .select()
                .single();

            if (chargeError) throw chargeError;

            return new Response(JSON.stringify({
                success: true,
                type: 'static',
                charge_id: charge.id,
                brcode: profile.pix_key,
                pix_key: profile.pix_key,
                pix_type: profile.pix_type,
                amount: valorFinal,
                expires_at: charge.expires_at
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 3. Gerar PIX dinâmico via Mercado Pago
        const valorFinal = amount || aluno.valor_mensalidade || 0;
        const nome = aluno.nome_responsavel || aluno.nome_completo || 'Cliente RotaFacil';
        const email = aluno.email || 'cliente@rotafacil.com';

        const mpBody = {
            transaction_amount: Number(valorFinal.toFixed(2)),
            description: `Matrícula: ${aluno.nome_completo}`,
            payment_method_id: 'pix',
            notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercado-pago-webhook`,
            payer: {
                email: email,
                first_name: nome.split(' ')[0],
                last_name: nome.split(' ').slice(1).join(' ') || 'RotaFacil',
                identification: aluno.cpf ? {
                    type: 'CPF',
                    number: aluno.cpf.replace(/\D/g, '')
                } : undefined
            },
            external_reference: `matricula:${aluno_id}`
        };

        console.log('Enviando para Mercado Pago:', JSON.stringify(mpBody));

        const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': `matricula-${aluno_id}-${Date.now()}`
            },
            body: JSON.stringify(mpBody),
        });

        if (!mpResponse.ok) {
            const errText = await mpResponse.text();
            console.error('Erro MP API:', errText);
            const errJson = JSON.parse(errText);
            return new Response(JSON.stringify({
                success: false,
                error: errJson.message || 'Erro na API do Mercado Pago'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const mpData = await mpResponse.json();
        console.log('Resposta MP:', JSON.stringify(mpData.point_of_interaction?.transaction_data));

        // 4. Salvar cobrança no banco
        const { data: charge, error: chargeError } = await supabase
            .from('aluno_pix_charges')
            .insert({
                aluno_id,
                tenant_id,
                amount: valorFinal,
                brcode: mpData.point_of_interaction?.transaction_data?.qr_code,
                qr_code_base64: mpData.point_of_interaction?.transaction_data?.qr_code_base64,
                status: 'PENDING',
                expires_at: mpData.date_of_expiration,
                payment_method: 'mercadopago_dynamic'
            })
            .select()
            .single();

        if (chargeError) {
            console.error('Erro ao salvar charge:', chargeError);
        }

        return new Response(JSON.stringify({
            success: true,
            type: 'dynamic',
            charge_id: charge?.id,
            brcode: mpData.point_of_interaction?.transaction_data?.qr_code,
            qr_code_base64: mpData.point_of_interaction?.transaction_data?.qr_code_base64,
            ticket_url: mpData.point_of_interaction?.transaction_data?.ticket_url,
            mp_id: mpData.id,
            amount: valorFinal,
            expires_at: mpData.date_of_expiration
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Erro na função:', error.message);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
