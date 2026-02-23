require('dotenv').config();
const axios = require('axios');

async function testShipping() {
    const token = process.env.MELHOR_ENVIO_TOKEN;
    console.log('Token presente?', !!token);

    if (!token) {
        console.error('Sem token!');
        return;
    }

    const payload = {
        from: { postal_code: '83301000' }, // Piraquara
        to: { postal_code: '80010000' }, // Curitiba (Local)
        items: [
            {
                id: '1',
                width: 15,
                height: 10,
                length: 20,
                weight: 0.5,
                insurance_value: 50,
                quantity: 1
            }
        ]
    };

    try {
        console.log('Enviando request para Melhor Envio (Sandbox/Prod)...');
        // Tenta URL de Produção primeiro (token normal)
        const url = 'https://melhorenvio.com.br/api/v2/me/shipment/calculate';

        const response = await axios.post(url, payload, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'Teste/1.0'
            },
            timeout: 10000
        });

        console.log('Status:', response.status);
        console.log('Dados:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Erro na requisição:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testShipping();
