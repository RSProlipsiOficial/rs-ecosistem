
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkL1() {
    const JM_ID = '034051dc-8742-4df4-85ff-36a01844c612';

    console.log('=== VERIFICANDO NÍVEL 1 DE JM NA MATRIZ ===');
    const { data: l1, error } = await supabase
        .from('downlines')
        .select('downline_id, linha, consultores!downline_id(nome)')
        .eq('upline_id', JM_ID)
        .eq('nivel', 1)
        .order('linha');

    if (error) console.error(error);

    l1.forEach(m => {
        console.log(`Slot ${m.linha}: ${m.consultores?.nome} (${m.downline_id})`);
    });
}

checkL1().catch(console.error);
