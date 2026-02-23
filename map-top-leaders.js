const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findTopLeaders() {
    console.log('--- MAPA DE LÍDERES (UNILEVEL) ---');

    const { data: allConsultores } = await supabase.from('consultores').select('id, nome, patrocinador_id');

    const counts = {};
    allConsultores.forEach(c => {
        const pid = c.patrocinador_id;
        if (pid) {
            counts[pid] = (counts[pid] || 0) + 1;
        }
    });

    const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);

    for (const [id, count] of sorted) {
        const { data: c } = await supabase.from('consultores').select('nome').eq('id', id).single();
        console.log(`${c?.nome || '???'} (ID: ${id}) -> ${count} indicados.`);
    }
}

findTopLeaders();
