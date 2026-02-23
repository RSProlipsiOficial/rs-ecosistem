const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function deepSearch() {
    console.log('--- BUSCA PROFUNDA DE LÍDERES ---');

    const searchTerms = ['Maxwell', 'Miranda', 'Emanuel', 'Costa', 'Marilza'];

    for (const term of searchTerms) {
        const { data: users } = await supabase
            .from('consultores')
            .select('id, nome, email, patrocinador_id')
            .ilike('nome', `%${term}%`);

        console.log(`Termo "${term}":`, users);
    }

    // Buscar o Root para ver quem são seus diretos imediatos
    const ROOT_ID = '89c000c0-7a39-4e1e-8dee-5978d846fa89';
    const { data: rootDirects } = await supabase
        .from('downlines')
        .select('downline_id, linha, nivel')
        .eq('upline_id', ROOT_ID)
        .eq('nivel', 1);

    console.log('\nDiretos do ROOT (L1):');
    for (const d of (rootDirects || [])) {
        const { data: c } = await supabase.from('consultores').select('nome').eq('id', d.downline_id).single();
        console.log(`- Slot ${d.linha}: ${c?.nome} (${d.downline_id})`);
    }
}

deepSearch();
