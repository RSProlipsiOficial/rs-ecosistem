const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findMirandaUnderMaxwell() {
    const MAXWELL_ID = '69806370-f06e-4c5f-b728-f96410a6f462';

    console.log('--- BUSCANDO JOÃO MIRANDA SOB MAXWELL ---');

    const { data: underMaxwell } = await supabase
        .from('consultores')
        .select('id, nome, email, patrocinador_id')
        .eq('patrocinador_id', MAXWELL_ID);

    console.log('Consultores diretamente sob Maxwell:', underMaxwell);

    // Se não achar pelo patrocinador direto, buscar em toda a rede descendente do Maxwell
    // (Limitado a alguns níveis para evitar stack overflow)
    async function getDescendants(parentId, searchName = 'Miranda') {
        const { data: children } = await supabase.from('consultores').select('id, nome, patrocinador_id').eq('patrocinador_id', parentId);
        let found = [];
        if (children) {
            for (const c of children) {
                if (c.nome.includes(searchName) || c.nome.includes('João')) {
                    found.push(c);
                }
                const deep = await getDescendants(c.id, searchName);
                found = found.concat(deep);
                if (found.length > 50) break; // Trava de segurança
            }
        }
        return found;
    }

    console.log('\n--- BUSCA RECURSIVA NA REDE DO MAXWELL ---');
    const allRelated = await getDescendants(MAXWELL_ID);
    console.log('Resultados encontrados na rede do Maxwell:', allRelated);
}

findMirandaUnderMaxwell();
