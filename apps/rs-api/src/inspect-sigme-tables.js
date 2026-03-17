const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectTables() {
    console.log('--- INSPEÇÃO DE TABELAS SIGME ---');

    const { data: acc, error: errAcc } = await supabase.from('matrix_accumulator').select('*').limit(1);
    if (!errAcc && acc && acc.length > 0) {
        console.log('Colunas de matrix_accumulator:', Object.keys(acc[0]));
    } else {
        console.log('matrix_accumulator vazia ou erro:', errAcc);
    }

    const { data: cyc, error: errCyc } = await supabase.from('matriz_cycles').select('*').limit(1);
    if (!errCyc && cyc && cyc.length > 0) {
        console.log('Colunas de matriz_cycles:', Object.keys(cyc[0]));
    } else {
        console.log('matriz_cycles vazia ou erro:', errCyc);
    }

    console.log('---------------------------------');
}

inspectTables().catch(console.error);
