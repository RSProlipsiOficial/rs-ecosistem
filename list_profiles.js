
const fs = require('fs');
const path = require('path');

async function inspect() {
    const envPath = path.join(__dirname, 'apps/rs-api/.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const getEnv = (key) => envContent.match(new RegExp(`${key}=(.*)`))[1].trim();

    const url = getEnv('SUPABASE_URL');
    const key = getEnv('SUPABASE_SERVICE_ROLE_KEY');

    console.log('\n--- Listando todos os minisite_profiles ---');
    const res = await fetch(`${url}/rest/v1/minisite_profiles?select=id,name,type`, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}

inspect().catch(console.error);
