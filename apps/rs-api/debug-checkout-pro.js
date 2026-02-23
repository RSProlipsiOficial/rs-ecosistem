
const axios = require('axios');

async function run() {
    console.log('🚀 Enviando payload Checkout Pro (CPF Vazio)...');

    const payload = {
        buyerId: '1ace091e-473b-4b4f-b124-f40abc4e149e', // AUTH.USERS.ID (simula frontend)
        buyerEmail: 'rsprolipsioficial@gmail.com',
        buyerName: 'Debug User',
        buyerPhone: '41999999999',
        buyerCpf: '', // CPF VAZIO PROPOSITALMENTE
        items: [
            {
                product_id: 'a79dfdc0-e2de-4ba5-8ca4-46a7a49940eb',
                product_name: 'Produto Teste',
                quantity: 1,
                price_final: 70.00
            }
        ],
        subtotal: 70.00,
        discount: 0,
        total: 70.00,
        customerNotes: 'Debug Checkout Pro',
        paymentMethod: 'checkout-pro', // Importante
        shippingAddress: {
            street: 'Rua Teste',
            number: '123',
            neighborhood: 'Centro',
            city: 'Curitiba',
            state: 'PR',
            zipCode: '80000000'
        },
        shippingMethod: 'PAC',
        shippingCost: 0
    };

    try {
        const res = await axios.post('http://localhost:4000/api/checkout/create', payload);
        console.log('✅ Sucesso:', JSON.stringify(res.data, null, 2));
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

run();
