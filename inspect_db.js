
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspect() {
    console.log('--- Inspecionando minisite_profiles ---');
    const { data: mData, error: mErr } = await supabase.from('minisite_profiles').select('*').limit(1);
    if (mErr) {
        console.error('Erro minisite_profiles:', mErr);
    } else {
        console.log('Colunas minisite_profiles:', Object.keys(mData[0] || {}));
        console.log('Tipos únicos em minisite_profiles:', await supabase.rpc('get_unique_types_minisite').catch(() => 'RPC não existe'));
    }

    console.log('\n--- Inspecionando marketing_pixels ---');
    const { data: pData, error: pErr } = await supabase.from('marketing_pixels').select('*').limit(1);
    if (pErr) {
        console.error('Erro marketing_pixels:', pErr);
    } else {
        console.log('Colunas marketing_pixels:', Object.keys(pData[0] || {}));
    }
}

inspect();
