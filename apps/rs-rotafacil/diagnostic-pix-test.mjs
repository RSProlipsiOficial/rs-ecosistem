#!/usr/bin/env node

// TESTE DEFINITIVO - MercadoPago Pix
// Execute: node diagnostic-pix-test.mjs

const TOKEN = 'APP_USR-7775914435593768-080212-ca91c8f829c87e5885ae7b4bf6ed74c5-2069869679';

async function testarMercadoPago() {
    console.log('🔍 TESTE DIAGNÓSTICO - MercadoPago Pix\n');
    console.log('='.repeat(60));

    // Teste 1: Verificar se o token é válido
    console.log('\n[1/3] Testando validade do token...');
    try {
        const meResponse = await fetch('https://api.mercadopago.com/v1/users/me', {
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            }
        });

        if (meResponse.ok) {
            const meData = await meResponse.json();
            console.log('✅ Token VÁLIDO');
            console.log(`   Conta: ${meData.email}`);
            console.log(`   País: ${meData.site_id}`);
            console.log(`   ID: ${meData.id}`);
        } else {
            const errorText = await meResponse.text();
            console.log(`❌ Token INVÁLIDO - Status: ${meResponse.status}`);
            console.log(`   Resposta: ${errorText}`);
            return;
        }
    } catch (error) {
        console.log('❌ Erro de rede:', error.message);
        return;
    }

    // Teste 2: Verificar pagamentos disponíveis
    console.log('\n[2/3] Verificando métodos de pagamento disponíveis...');
    try {
        const pmResponse = await fetch('https://api.mercadopago.com/v1/payment_methods', {
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            }
        });

        if (pmResponse.ok) {
            const methods = await pmResponse.json();
            const pixMethod = methods.find(m => m.id === 'pix');
            if (pixMethod) {
                console.log('✅ Pix está DISPONÍVEL');
                console.log(`   Status: ${pixMethod.status}`);
            } else {
                console.log('❌ Pix NÃO ENCONTRADO nos métodos de pagamento');
                console.log('   Métodos disponíveis:', methods.map(m => m.id).join(', '));
            }
        }
    } catch (error) {
        console.log('⚠️  Não foi possível verificar métodos:', error.message);
    }

    // Teste 3: Criar um pagamento Pix de TESTE
    console.log('\n[3/3] Tentando criar pagamento Pix de TESTE...');

    const idempotencyKey = `test-${Date.now()}`;
    const payload = {
        transaction_amount: 0.01, // R$ 0,01 para teste
        description: 'Teste MercadoPago Pix - RotaFácil',
        payment_method_id: 'pix',
        payer: {
            email: 'test_user_92661323@testuser.com',
            first_name: 'Teste',
            last_name: 'RotaFacil',
            identification: {
                type: 'CPF',
                number: '11144477735'
            }
        },
        external_reference: 'TEST-123'
    };

    console.log('   Payload:', JSON.stringify(payload, null, 2));
    console.log('   Idempotency Key:', idempotencyKey);

    try {
        const pixResponse = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': idempotencyKey
            },
            body: JSON.stringify(payload)
        });

        const pixText = await pixResponse.text();
        console.log(`\n   Status HTTP: ${pixResponse.status}`);

        if (pixResponse.ok) {
            const pixData = JSON.parse(pixText);
            console.log('✅ SUCESSO! Pix criado!');
            console.log(`   ID Pagamento: ${pixData.id}`);
            console.log(`   Status: ${pixData.status}`);
            if (pixData.point_of_interaction?.transaction_data?.qr_code) {
                console.log(`   QR Code: ${pixData.point_of_interaction.transaction_data.qr_code.substring(0, 50)}...`);
            }
        } else {
            console.log('❌ FALHOU ao criar Pix');
            console.log('\n   Resposta completa do MercadoPago:');
            console.log('   ' + '='.repeat(58));
            try {
                const errorData = JSON.parse(pixText);
                console.log(JSON.stringify(errorData, null, 2).split('\n').map(l => '   ' + l).join('\n'));

                // Interpretação do erro
                console.log('\n   📋 DIAGNÓSTICO:');
                if (errorData.message) {
                    console.log(`   - Mensagem: ${errorData.message}`);
                }
                if (errorData.cause && errorData.cause.length > 0) {
                    errorData.cause.forEach((c, i) => {
                        console.log(`   - Causa ${i + 1}: [${c.code}] ${c.description}`);
                    });
                }
                if (errorData.status === 401) {
                    console.log('   ⚠️  Token não autorizado ou expirado');
                }
                if (errorData.status === 400) {
                    console.log('   ⚠️  Dados do pagamento inválidos');
                }
            } catch (e) {
                console.log(pixText.split('\n').map(l => '   ' + l).join('\n'));
            }
        }
    } catch (error) {
        console.log('❌ Erro ao chamar API:', error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ TESTE CONCLUÍDO - Veja os resultados acima\n');
}

testarMercadoPago();
