/** 
 * Test MercadoPago Payment Creation
 * Run: node test-mercadopago.js
 */

const testMercadoPago = async () => {
    const ACCESS_TOKEN = 'APP_USR-7775914435593768-080212-ca91c8f829c87e5885ae7b4bf6ed74c5-2069869679';

    const payload = {
        transaction_amount: 260.00,
        description: 'Mensalidade Escolar - Yannis Camargo',
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
        external_reference: 'PAG-TEST-123'
    };

    console.log('🔄 Testing MercadoPago API...');
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));

    try {
        const response = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        console.log('📡 Status:', response.status);
        const responseText = await response.text();
        console.log('📄 Response:', responseText);

        if (response.ok) {
            const data = JSON.parse(responseText);
            console.log('\n✅ SUCCESS!');
            console.log('💳 Payment ID:', data.id);
            console.log('✅ Status:', data.status);
            if (data.point_of_interaction?.transaction_data) {
                console.log('📱 QR Code:', data.point_of_interaction.transaction_data.qr_code?.substring(0, 50) + '...');
            }
        } else {
            console.log('\n❌ ERROR!');
            try {
                const errData = JSON.parse(responseText);
                console.log('Error details:', JSON.stringify(errData, null, 2));
            } catch (e) {
                console.log('Raw error:', responseText);
            }
        }
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
};

testMercadoPago();
