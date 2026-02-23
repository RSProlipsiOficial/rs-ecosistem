const axios = require('axios');

async function testApi() {
    console.log('--- TESTE DE ENDPOINT: /v1/marketplace/products ---');
    try {
        const response = await axios.get('http://localhost:4000/v1/marketplace/products');
        console.log('Status:', response.status);
        console.log('Response Body:', JSON.stringify(response.data, null, 2));

        if (response.data.ok && response.data.data) {
            console.log(`✅ Sucesso! Recebidos ${response.data.data.length} produtos.`);
        } else {
            console.error('❌ Erro: Formato de resposta inesperado ou vazio.');
        }
    } catch (error) {
        console.error('❌ Erro na requisição:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
        }
    }
}

testApi();
