
async function testApi() {
    console.log('[TEST] Calling local API /v1/cds...');
    try {
        const res = await fetch('http://localhost:4000/v1/cds?tenantId=00000000-0000-0000-0000-000000000000');
        if (res.ok) {
            const json = await res.json();
            console.log('[TEST] Success:', JSON.stringify(json, null, 2));
        } else {
            console.error('[TEST] Failed:', res.status, await res.text());
        }
    } catch (e) {
        console.error('[TEST] Error connecting to API:', e.message);
    }
}

testApi();
