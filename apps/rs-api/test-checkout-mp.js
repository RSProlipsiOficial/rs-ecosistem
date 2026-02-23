require('dotenv').config();
const { MercadoPagoConfig, Payment } = require('mercadopago');
const crypto = require('crypto');

async function testPix() {
    const token = process.env.MP_ACCESS_TOKEN;
    console.log('Token MP presente?', !!token);

    if (!token) {
        console.error('Sem token MP!');
        return;
    }

    const client = new MercadoPagoConfig({ accessToken: token });
    const payment = new Payment(client);

    const idemKey = crypto.randomUUID();

    try {
        console.log('Criando Pix de teste...');
        const body = {
            transaction_amount: 1.00,
            description: 'Teste de Integração - RS Prólipsi',
            payment_method_id: 'pix',
            payer: {
                email: 'test_user_123@test.com',
                first_name: 'Test',
                last_name: 'User',
                identification: {
                    type: 'CPF',
                    number: '19119119100'
                }
            }
        };

        const response = await payment.create({
            body,
            requestOptions: { idempotencyKey: idemKey }
        });

        console.log('Status:', response.status);
        console.log('ID Pagamento:', response.id);
        console.log('QR Code:', !!response.point_of_interaction?.transaction_data?.qr_code);
    } catch (error) {
        console.error('Erro MP:', error.message);
        if (error.cause) {
            console.error('Causa:', JSON.stringify(error.cause, null, 2));
        }
    }
}

testPix();
