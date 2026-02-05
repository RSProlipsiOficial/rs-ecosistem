#!/usr/bin/env node

const TOKEN = 'APP_USR-8714634481363426-122511-37599c984b77525e8117ba2d063d1b51-2069869679';

async function testarToken3() {
    console.log('🔍 TESTANDO TOKEN #3\n');

    try {
        const meResponse = await fetch('https://api.mercadopago.com/v1/users/me', {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });

        if (!meResponse.ok) {
            console.log('❌ INVÁLIDO:', await meResponse.text());
            return false;
        }

        const meData = await meResponse.json();
        console.log('✅ TOKEN VÁLIDO!');
        console.log(`   Email: ${meData.email}`);
        console.log(`   Site: ${meData.site_id}`);

        // Criar Pix real
        console.log('\n🎯 Criando Pix REAL (R$ 260,00)...\n');

        const pixResponse = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': `pix-${Date.now()}`
            },
            body: JSON.stringify({
                transaction_amount: 260.00,
                description: 'Mensalidade - Yannis Camargo',
                payment_method_id: 'pix',
                payer: {
                    email: 'test_user_92661323@testuser.com',
                    first_name: 'Yannis',
                    last_name: 'Camargo',
                    identification: { type: 'CPF', number: '11144477735' }
                },
                external_reference: 'TEST-FINAL-3'
            })
        });

        if (pixResponse.ok) {
            const pix = await pixResponse.json();
            console.log('✅✅✅ PIX CRIADO COM SUCESSO! ✅✅✅');
            console.log(`\n   ID: ${pix.id}`);
            console.log(`   Status: ${pix.status}`);
            console.log(`   QR: ${pix.point_of_interaction?.transaction_data?.qr_code?.substring(0, 50)}...`);
            console.log('\n🎉🎉🎉 ESTE TOKEN FUNCIONA! 🎉🎉🎉\n');
            return true;
        } else {
            console.log('❌ Erro ao criar Pix:', await pixResponse.text());
            return false;
        }
    } catch (e) {
        console.log('❌ Erro:', e.message);
        return false;
    }
}

testarToken3();
