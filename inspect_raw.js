
const fs = require('fs');
const path = require('path');

async function inspect() {
    const envPath = path.join(__dirname, 'apps/rs-api/.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const getEnv = (key) => envContent.match(new RegExp(`${key}=(.*)`))[1].trim();

    const url = getEnv('SUPABASE_URL');
    const key = getEnv('SUPABASE_SERVICE_ROLE_KEY');

    console.log('URL:', url);

    async function checkTable(table) {
        console.log(`\n--- Inspecionando ${table} ---`);
        const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });
        const data = await res.json();
        if (data.error) {
            console.error(`Erro ${table}:`, data.error);
        } else {
            console.log(`Colunas ${table}:`, Object.keys(data[0] || {}));
        }
    }

    await checkTable('minisite_profiles');
    await checkTable('marketing_pixels');
}

inspect().catch(console.error);
