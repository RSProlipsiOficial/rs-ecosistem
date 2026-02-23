const fetch = require('node-fetch'); // Ou usar http nativo se node-fetch não estiver

async function testPix() {
    try {
        console.log('Testando PIX Local...');
        const response = await fetch('http://localhost:4000/v1/marketplace/pix', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 1.00,
                description: 'Teste API Local',
                payer: {
                    email: 'teste@email.com'
                }
            })
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response:', text);
    } catch (error) {
        console.error('Erro:', error.message);
    }
}

testPix();
