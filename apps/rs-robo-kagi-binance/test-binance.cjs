const crypto = require('crypto');
const axios = require('axios');

const apiKey = 'xO0viWURO5QFUYYe4qQkmAGJ9Wn7XKC7HqZzly2p5Tx3d4nlyrR4weKEz6OtWXMy';
const apiSecret = 'DSUrDvYU0UnXDsHNKIBW3kWL6v8vzTLR59L7XKq1lGM4qUOb5ukuu2cvKtJkok93';
const baseUrl = 'https://fapi.binance.com';

function sign(params, secret) {
    const queryString = Object.keys(params)
        .map(key => `${key}=${params[key]}`)
        .join('&');
    return crypto.createHmac('sha256', secret).update(queryString).digest('hex');
}

async function testBinance() {
    const endpoint = '/fapi/v2/account';
    const params = { timestamp: Date.now() };
    const signature = sign(params, apiSecret);
    const url = `${baseUrl}${endpoint}?${Object.keys(params).map(k => `${k}=${params[k]}`).join('&')}&signature=${signature}`;

    console.log('Testando conexão com a Binance...');
    try {
        const response = await axios({
            method: 'GET',
            url,
            headers: { 'X-MBX-APIKEY': apiKey }
        });
        console.log('✅ Conexão bem sucedida!');
        console.log('Saldo Total:', response.data.totalWalletBalance);
    } catch (error) {
        console.error('❌ Erro na conexão com a Binance:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data));
        } else {
            console.error('Mensagem:', error.message);
        }
    }
}

testBinance();
