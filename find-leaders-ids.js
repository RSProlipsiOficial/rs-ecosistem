const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findLideres() {
    const { data: maxwell } = await supabase.from('consultores').select('id, nome, patrocinador_id').ilike('nome', '%Maxwell%');
    const { data: miranda } = await supabase.from('consultores').select('id, nome, patrocinador_id').ilike('nome', '%João Miranda%');
    const { data: marilza } = await supabase.from('consultores').select('id, nome, patrocinador_id').ilike('nome', '%Marilza%');

    console.log('Maxwell:', maxwell);
    console.log('João Miranda:', miranda);
    console.log('Marilza:', marilza);

    if (maxwell && miranda) {
        console.log('\n--- VERIFICANDO DESCENDENTES DE JOÃO MIRANDA ---');
        const { data: mirandaTeam } = await supabase.from('consultores').select('id, nome, patrocinador_id').eq('patrocinador_id', miranda[0].id);
        console.log(`João Miranda tem ${mirandaTeam?.length || 0} indicados diretos.`);

        const { data: matrixMiranda } = await supabase.from('downlines').select('upline_id, nivel, linha').eq('downline_id', miranda[0].id);
        console.log('João Miranda está na matriz sob:', matrixMiranda);
    }
}

findLideres();
