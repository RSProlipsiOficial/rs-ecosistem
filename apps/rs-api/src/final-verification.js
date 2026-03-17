const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function finalVerify() {
    console.log('--- VERIFICAÇÃO FINAL DE DADOS ---');

    // 1. Matrix Accumulator
    const { data: acc } = await supabase.from('matrix_accumulator').select('*');
    console.log('Matrix Accumulator:', JSON.stringify(acc, null, 2));

    // 2. Ciclos Abertos/Completados
    const { data: cycles } = await supabase.from('matriz_cycles').select('consultor_id, cycle_number, status, slots_filled').order('cycle_number', {ascending: false});
    console.log('Ciclos Recentes:', JSON.stringify(cycles, null, 2));

    console.log('---------------------------------');
}

finalVerify().catch(console.error);
