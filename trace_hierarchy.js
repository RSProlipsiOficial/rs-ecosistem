
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function traceHierarchy() {
    console.log('=== RASTREANDO HIERARQUIA MATRIZ ===');

    // 1. Achar Maxwell Ramos
    const { data: maxwell } = await supabase
        .from('consultores')
        .select('id, nome')
        .ilike('nome', '%MAXWELL RAMOS%')
        .single();

    if (!maxwell) {
        console.log('Maxwell Ramos não encontrado.');
        return;
    }
    console.log(`Pai (MS): ${maxwell.nome} (${maxwell.id})`);

    // 2. Filhos de Maxwell na Matriz
    const { data: mwChildren } = await supabase
        .from('downlines')
        .select('downline_id, linha, consultores!downline_id(nome)')
        .eq('upline_id', maxwell.id)
        .eq('nivel', 1)
        .order('linha');

    console.log('\nFilhos de Maxwell (Nível 1 Matriz):');
    mwChildren.forEach(c => {
        console.log(` Slot ${c.linha}: ${c.consultores?.nome} (${c.downline_id})`);
    });

    // 3. Achar o João Miranda que está sob Maxwell
    const jmUnderMw = mwChildren.find(c => c.consultores?.nome?.toUpperCase().includes('MIRANDA'));
    if (!jmUnderMw) {
        console.log('\nJoão Miranda não encontrado sob Maxwell na Matriz.');
        return;
    }

    const JM_ID = jmUnderMw.downline_id;
    console.log(`\nJoão Miranda Confirmado (JM): ${jmUnderMw.consultores.nome} (${JM_ID})`);

    // 4. Filhos deste João Miranda
    const { data: jmChildren } = await supabase
        .from('downlines')
        .select('downline_id, linha, consultores!downline_id(nome)')
        .eq('upline_id', JM_ID)
        .eq('nivel', 1)
        .order('linha');

    console.log(`\nFilhos de ${jmUnderMw.consultores.nome} (Nível 1 Matriz):`);
    jmChildren.forEach(c => {
        console.log(` Slot ${c.linha}: ${c.consultores?.nome} (${c.downline_id})`);
    });
}

traceHierarchy().catch(console.error);
