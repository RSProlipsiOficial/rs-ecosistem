
const axios = require('axios');
require('dotenv').config();

async function run() {
    const token = process.env.MELHOR_ENVIO_TOKEN;
    if (!token) {
        console.log('❌ MELHOR_ENVIO_TOKEN não encontrado no .env');
        return;
    }
    console.log('Token encontrado, tamanho:', token.length);

    try {
        const response = await axios.post(
            'https://melhorenvio.com.br/api/v2/me/shipment/calculate',
            {
                from: { postal_code: '83302180' }, // Piraquara
                to: { postal_code: '01001000' },   // SP Centro
                products: [{
                    id: 'test-1',
                    width: 15,
                    height: 10,
                    length: 20,
                    weight: 0.5,
                    insurance_value: 60,
                    quantity: 1
                }]
            },
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'User-Agent': 'RS-Prolipsi (operacoes@rsprolipsi.com.br)'
                },
                timeout: 10000
            }
        );

        console.log('✅ Resposta Melhor Envio:');
        if (Array.isArray(response.data)) {
            response.data.forEach(opt => {
                if (!opt.error) {
                    console.log(`  ${opt.name} (${opt.company?.name}) - R$ ${opt.price} - ${opt.delivery_time} dias`);
                }
            });
        } else {
            console.log(JSON.stringify(response.data, null, 2));
        }
    } catch (err) {
        console.error('❌ Erro:', err.response?.status, err.response?.data || err.message);
    }
}

run();
