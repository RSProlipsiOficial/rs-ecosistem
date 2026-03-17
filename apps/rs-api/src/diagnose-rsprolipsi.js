const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function diagnoseRsprolipsi() {
    const userId = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
    console.log(`🔍 DIAGNÓSTICO PARA RSPROLIPSI (${userId})`);

    // 1. Ver os diretos
    const { data: directs } = await supabase
        .from('downlines')
        .select('downline_id, nivel, linha')
        .eq('upline_id', userId)
        .eq('nivel', 1);

    console.log(`\n📦 Tem ${directs?.length || 0} diretos no total.`);

    if (directs && directs.length > 0) {
        const directIds = directs.map(d => d.downline_id);
        
        // Ver status no matrix_accumulator
        const { data: accs } = await supabase
            .from('matrix_accumulator')
            .select('*')
            .in('consultor_id', directIds);

        console.log(`\n📊 Status no matrix_accumulator para os diretos:`);
        directs.forEach(d => {
            const acc = accs?.find(a => a.consultor_id === d.downline_id);
            console.log(`- ID: ${d.downline_id} | Linha: ${d.linha} | Gasto: ${acc?.accumulated_value || 0} | Ativações: ${acc?.total_activated || 0}`);
        });
    }

    // 2. Ver ciclos atuais
    const { data: cycles } = await supabase
        .from('matriz_cycles')
        .select('*')
        .eq('consultor_id', userId)
        .order('cycle_number', { ascending: true });

    console.log(`\n🔄 Ciclos Registrados:`);
    console.log(JSON.stringify(cycles, null, 2));
}

diagnoseRsprolipsi().catch(console.error);
