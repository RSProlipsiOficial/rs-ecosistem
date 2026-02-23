
const fs = require('fs');
const path = require('path');

async function testApiFlow() {
    const envPath = path.join(__dirname, 'apps/rs-api/.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const getEnv = (key) => envContent.match(new RegExp(`${key}=(.*)`))[1].trim();

    const url = getEnv('SUPABASE_URL');
    const key = getEnv('SUPABASE_SERVICE_ROLE_KEY');

    console.log('--- Testando Query CDs ---');
    const resCds = await fetch(`${url}/rest/v1/minisite_profiles?select=*&or=(type.ilike.cd,type.ilike.franquia,type.ilike.proprio,type.ilike.hibrido,type.ilike.%25sede%25)`, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    });
    const cdsData = await resCds.json();
    console.log('CDS Result:', JSON.stringify(cdsData, null, 2));

    console.log('\n--- Testando Query Pixels ---');
    const resPixels = await fetch(`${url}/rest/v1/marketing_pixels?select=*&tenant_id=eq.00000000-0000-0000-0000-000000000000`, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    });
    const pixelsData = await resPixels.json();
    console.log('Pixels Result (RAW):', JSON.stringify(pixelsData, null, 2));
}

testApiFlow().catch(console.error);
