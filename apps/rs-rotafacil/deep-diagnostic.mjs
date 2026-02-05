#!/usr/bin/env node

const TOKEN = 'APP_USR-8714634481363426-122511-37599c984b77525e8117ba2d063d1b51-2069869679';

async function deepDiagnostic() {
    console.log('🧪 DIAGNÓSTICO PROFUNDO - MercadoPago Business\n');

    const endpoints = [
        { name: 'Profile (Me)', url: 'https://api.mercadopago.com/v1/users/me' },
        { name: 'Payment Methods', url: 'https://api.mercadopago.com/v1/payment_methods' }
    ];

    for (const ep of endpoints) {
        process.stdout.write(`Testing ${ep.name}... `);
        try {
            const resp = await fetch(ep.url, {
                headers: { 'Authorization': `Bearer ${TOKEN}` }
            });

            const text = await resp.text();
            let data;
            try { data = JSON.parse(text); } catch (e) { data = text; }

            if (resp.ok) {
                console.log('✅ OK');
                if (ep.name === 'Profile (Me)') {
                    console.log(`   - ID: ${data.id}`);
                    console.log(`   - Site: ${data.site_id}`);
                }
                if (ep.name === 'Payment Methods') {
                    const pix = Array.isArray(data) ? data.find(m => m.id === 'pix') : null;
                    if (pix) {
                        console.log(`   - Pix Status: ${pix.status}`);
                    } else {
                        console.log('   - Pix NOT found in payment methods');
                        console.log('   - Available Methods:', Array.isArray(data) ? data.map(m => m.id).join(', ') : 'None');
                    }
                }
            } else {
                console.log(`❌ FAILED (${resp.status})`);
                console.log(`   Response: ${text.substring(0, 200)}`);
            }
        } catch (e) {
            console.log(`❌ ERROR: ${e.message}`);
        }
    }
}

deepDiagnostic();
