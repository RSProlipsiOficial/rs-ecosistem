import { FastifyInstance } from 'fastify';
import { supabase } from '../lib/supabaseClient';
// @ts-ignore
import mercadopago from 'mercadopago';

export async function marketplaceRoutes(app: FastifyInstance) {

    // POST /v1/marketplace/pix
    app.post('/pix', async (request, reply) => {
        try {
            const { amount, description, payer } = request.body as any;

            console.log('🛒 [MARKETPLACE] Processando PIX:', { amount, description });

            // 1. Buscar token do Mercado Pago de QUALQUER usuário admin/dono
            // (Prioridade: admin > diag-agent > qualquer um com token)
            const { data: profiles, error } = await supabase
                .from('user_profiles')
                .select('mercadopago_access_token, pix_key')
                .neq('mercadopago_access_token', null)
                .limit(1);

            if (error || !profiles || profiles.length === 0) {
                console.error('❌ Nenhum token Mercado Pago encontrado no banco:', error);
                return reply.status(500).send({ error: 'Configuração de pagamento não encontrada na plataforma.' });
            }

            const accessToken = profiles[0].mercadopago_access_token;

            // 2. Configurar SDK Mercado Pago
            // @ts-ignore
            mercadopago.configurations.setAccessToken(accessToken);

            // 3. Criar preferência de pagamento / pagamento direto
            const payment_data = {
                transaction_amount: Number(amount),
                description: description || 'Pedido Marketplace',
                payment_method_id: 'pix',
                payer: {
                    email: payer?.email || 'cliente@marketplace.com',
                    first_name: payer?.first_name || 'Cliente',
                    last_name: payer?.last_name || 'Marketplace',
                    identification: {
                        type: 'CPF',
                        number: payer?.identification?.number || '19119119100'
                    }
                }
            };

            // @ts-ignore
            const payment = await mercadopago.payment.create(payment_data);

            const { body } = payment;

            console.log('✅ [MARKETPLACE] PIX Gerado:', body.id);

            return reply.send({
                success: true,
                id: body.id,
                status: body.status,
                qr_code: body.point_of_interaction?.transaction_data?.qr_code,
                qr_code_base64: body.point_of_interaction?.transaction_data?.qr_code_base64,
                ticket_url: body.point_of_interaction?.transaction_data?.ticket_url
            });

        } catch (error: any) {
            console.error('❌ Erro Marketplace PIX:', error);
            return reply.status(500).send({
                error: 'Erro ao gerar PIX',
                details: error.message
            });
        }
    });
}
