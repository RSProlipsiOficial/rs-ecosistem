#!/usr/bin/env node

const TOKEN = 'APP_USR-8714634481363426-122511-37599c984b77525e8117ba2d063d1b51-2069869679';

async function testPix() {
    console.log('🎯 TESTE DE GERAÇÃO PIX REAL\n');

    const body = {
        transaction_amount: 5.00, // Valor baixo para teste
        description: 'Teste - RotaFacil',
        payment_method_id: 'pix',
        payer: {
            email: 'test_user_92661323@testuser.com',
            first_name: 'Teste',
            last_name: 'Usuário',
            identification: { type: 'CPF', number: '11144477735' }
        },
        external_reference: 'DIAGNOSTIC-PIX-' + Date.now()
    };

    try {
        const resp = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': 'key-' + Date.now()
            },
            body: JSON.stringify(body)
        });

        const text = await resp.text();
        let data;
        try { data = JSON.parse(text); } catch (e) { data = text; }

        if (resp.ok) {
            console.log('✅ PIX GERADO COM SUCESSO!');
            console.log(`   ID: ${data.id}`);
            console.log(`   Status: ${data.status}`);
            console.log(`   URL: ${data.point_of_interaction?.transaction_data?.ticket_url}`);
        } else {
            console.log(`❌ ERRO NA GERAÇÃO (${resp.status})`);
            console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
        }
    } catch (e) {
        console.log(`❌ ERRO FATAL: ${e.message}`);
    }
}

testPix();
