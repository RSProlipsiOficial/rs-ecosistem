
async function test() {
    try {
        console.log('--- TESTE API RS-PROLIPSI (FETCH) ---');
        const res = await fetch('http://localhost:4000/v1/admin/consultants');
        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Body:', text.substring(0, 200));
    } catch (err) {
        console.error('❌ Erro:', err.message);
    }
}

test();
