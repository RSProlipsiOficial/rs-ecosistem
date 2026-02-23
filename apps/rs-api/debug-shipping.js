const axios = require('axios');

async function testShipping() {
    try {
        const payload = {
            from: { postal_code: '83301000' }, // Piraquara (Origem)
            to: { postal_code: '01001000' },   // SP (Destino Exemplo)
            products: [
                {
                    id: 'prod-1',
                    width: 11,
                    height: 16,
                    length: 11,
                    weight: 0.3,
                    insurance_value: 100,
                    quantity: 1
                }
            ]
        };

        console.log('Sending payload:', JSON.stringify(payload, null, 2));

        const res = await axios.post('http://localhost:4000/api/shipping/calculate', payload);

        console.log('--- RESPONSE STATUS ---');
        console.log(res.status);
        console.log('--- RESPONSE DATA ---');
        console.log(JSON.stringify(res.data, null, 2));

        console.log('--- PRICE ANALYSIS ---');
        res.data.forEach(opt => {
            console.log(`Service: ${opt.name}`);
            console.log(`Price Raw:`, opt.price, `Type:`, typeof opt.price);
            console.log(`Number(price):`, Number(opt.price));
        });

    } catch (error) {
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testShipping();
