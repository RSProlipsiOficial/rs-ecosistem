const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSpecificLinks() {
    const names = ['Michael', 'João Miranda', 'Maxwell', 'Celso Lopes', 'Oseias'];

    console.log('--- AUDITORIA DE ELOS UNILEVEL ---');

    for (const name of names) {
        const { data: users } = await supabase.from('consultores').select('id, nome, patrocinador_id').ilike('nome', `%${name}%`);
        if (!users) continue;

        for (const u of users) {
            const { data: sponsor } = u.patrocinador_id ? await supabase.from('consultores').select('nome').eq('id', u.patrocinador_id).single() : { data: { nome: 'ROOT' } };
            console.log(`Consultor: ${u.nome} (${u.id})`);
            console.log(`  Patrocinador Unilevel: ${sponsor?.nome || 'N/A'} (${u.patrocinador_id || 'ROOT'})`);

            // Ver quantos diretos ele tem no Unilevel
            const { count } = await supabase.from('consultores').select('*', { count: 'exact', head: true }).eq('patrocinador_id', u.id);
            console.log(`  Total de Diretos (Unilevel): ${count || 0}`);
        }
    }
}

checkSpecificLinks();
