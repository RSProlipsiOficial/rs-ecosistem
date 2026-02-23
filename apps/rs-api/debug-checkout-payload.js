
const axios = require('axios');

async function testCheckout() {
    const payload = {
        buyerId: 'd107da4e-e266-41b0-947a-0c66b2f2b9ef',
        buyerEmail: 'rsprolipsioficial@gmail.com',
        buyerName: 'Rota Fácil Oficial',
        buyerPhone: '(41) 99286-3922',
        buyerCpf: '19100000000', // CPF Aleatório Válido para Sandbox
        items: [
            {
                product_id: 'a79dfdc0-e2de-4ba5-8ca4-46a7a49940eb',
                product_name: 'Diag Product 1771346594325',
                quantity: 1,
                price_final: 60.00
            }
        ],
        shippingAddress: {
            street: 'Rua Tereza Liberato Ricardo',
            number: '13',
            neighborhood: 'Planta Vera Cruz',
            city: 'Piraquara',
            state: 'PR',
            zipCode: '83314-326'
        },
        shippingMethod: 'correios-pac-mock',
        shippingCost: 12.90,
        paymentMethod: 'pix',
        subtotal: 60.00,
        discount: 0,
        total: 72.90,
        customerNotes: 'Teste via Script'
    };

    try {
        console.log('🚀 Enviando payload simulado...');
        const res = await axios.post('http://localhost:4000/api/checkout/create', payload);
        console.log('✅ Status:', res.status);
        console.log('✅ Headers:', res.headers);
        console.log('✅ Data:', JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error('❌ Erro na requisição:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

testCheckout();
