const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const JM_ID = '034051dc-8742-4df4-85ff-36a01844c612';

async function auditJM() {
    console.log('--- AUDITORIA DETALHADA: JOÃO MIRANDA ---');

    // 1. Buscar todos os indicadores diretos no Unilevel
    const { data: indicators, error: infError } = await supabase
        .from('consultores')
        .select('id, nome, created_at')
        .eq('patrocinador_id', JM_ID)
        .order('created_at', { ascending: true });

    if (infError) {
        console.error('Erro ao buscar indicadores:', infError);
        return;
    }

    console.log(`João Miranda possui ${indicators.length} indicadores diretos no Unilevel.`);

    // 2. Verificar onde cada um está na matriz (downlines)
    for (const [idx, ind] of indicators.entries()) {
        const { data: downline } = await supabase
            .from('downlines')
            .select('upline_id, linha, nivel, created_at')
            .eq('downline_id', ind.id)
            .single();

        if (downline) {
            const { data: upline } = await supabase
                .from('consultores')
                .select('nome')
                .eq('id', downline.upline_id)
                .single();

            console.log(`${idx + 1}. [${ind.created_at}] ${ind.nome}`);
            console.log(`   Matriz: Sob ${upline?.nome || '???'} (ID: ${downline.upline_id}) - Slot ${downline.linha}`);
        } else {
            console.log(`${idx + 1}. [${ind.created_at}] ${ind.nome} - ⚠️ NÃO ENCONTRADO NA MATRIZ`);
        }
    }

    // 3. Verificar o primeiro nível de JM na matriz
    const { data: directDowns } = await supabase
        .from('downlines')
        .select('downline_id, linha, consultores!downline_id(nome)')
        .eq('upline_id', JM_ID)
        .order('linha', { ascending: true });

    console.log('\n--- NÍVEL 1 DE JM NA MATRIZ ---');
    directDowns?.forEach(d => {
        console.log(`Slot ${d.linha}: ${d.consultores?.nome} (${d.downline_id})`);
    });
}

auditJM();
