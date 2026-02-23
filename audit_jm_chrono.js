
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const JM_ID = '034051dc-8742-4df4-85ff-36a01844c612';

    // 1. Get directs ordered by creation
    const { data: directs, error: e1 } = await supabase
        .from('consultores')
        .select('id, nome, created_at')
        .eq('patrocinador_id', JM_ID)
        .order('created_at', { ascending: true });

    if (e1) throw e1;

    console.log(`\nJoão Miranda tem ${directs.length} diretos.`);

    // 2. Get current matrix placements for these directs
    const directIds = directs.map(d => d.id);
    const { data: matrix, error: e2 } = await supabase
        .from('downlines')
        .select('downline_id, upline_id, linha, nivel, consultores!upline_id(nome)')
        .in('downline_id', directIds)
        .eq('nivel', 1);

    if (e2) throw e2;

    const mMap = {};
    matrix.forEach(m => mMap[m.downline_id] = m);

    console.log('\n--- ORDEM CRONOLÓGICA VS MATRIZ ---');
    directs.forEach((d, i) => {
        const pos = mMap[d.id];
        const status = pos ? `OK ( sob ${pos.consultores?.nome || pos.upline_id} S${pos.linha} )` : 'NÃO NA MATRIZ';
        console.log(`${(i + 1).toString().padStart(2)}: ${d.nome.padEnd(30)} | Criado: ${d.created_at} | Matriz: ${status}`);
    });
}

run().catch(console.error);
