#!/usr/bin/env node

// TESTE COM O NOVO TOKEN
const TOKEN = 'APP_USR-1669020763404156-110410-eb566e04068bb302b168c9eafbdf01a1-2069869679';

async function testarNovoToken() {
    console.log('🔍 TESTANDO NOVO TOKEN DE PRODUÇÃO\n');

    // Teste 1: Validar token
    console.log('[1/2] Validando token...');
    const meResponse = await fetch('https://api.mercadopago.com/v1/users/me', {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
    });

    if (!meResponse.ok) {
        console.log('❌ Token inválido:', await meResponse.text());
        return;
    }

    const meData = await meResponse.json();
    console.log('✅ Token VÁLIDO!');
    console.log(`   Email: ${meData.email}`);
    console.log(`   País: ${meData.site_id}`);

    // Teste 2: Criar Pix de teste
    console.log('\n[2/2] Criando Pix de teste (R$ 260,00)...');

    const payload = {
        transaction_amount: 260.00,
        description: 'Mensalidade - Yannis Camargo',
        payment_method_id: 'pix',
        payer: {
            email: 'test_user_92661323@testuser.com',
            first_name: 'Yannis',
            last_name: 'Camargo',
            identification: {
                type: 'CPF',
                number: '11144477735'
            }
        },
        external_reference: 'TEST-FINAL'
    };

    const pixResponse = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': `test-final-${Date.now()}`
        },
        body: JSON.stringify(payload)
    });

    const pixText = await pixResponse.text();

    if (pixResponse.ok) {
        const pixData = JSON.parse(pixText);
        console.log('✅ PIX CRIADO COM SUCESSO!');
        console.log(`   ID: ${pixData.id}`);
        console.log(`   Status: ${pixData.status}`);
        console.log(`   QR Code: ${pixData.point_of_interaction?.transaction_data?.qr_code?.substring(0, 60)}...`);
        console.log('\n🎉 TOKEN FUNCIONA PERFEITAMENTE!');
    } else {
        console.log('❌ Erro:', pixText);
    }
}

testarNovoToken();
