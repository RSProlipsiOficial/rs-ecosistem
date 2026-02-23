const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'apps/rs-api/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function finalCorrection() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const rootId = '89c000c0-7a39-4e1e-8dee-5978d846fa89'; // RS Prólipsi
    const otherRootId = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef'; // Rota Fácil
    const emanuelId = '179d44cd-3351-4cdb-ad1e-78ac274108c2';

    console.log('--- OPERAÇÃO DE CORREÇÃO FINAL ---');

    // 1. Localizar Maxwell
    const { data: maxwell } = await supabase
        .from('consultores')
        .select('id, nome, created_at')
        .ilike('nome', '%maxwel%')
        .single();

    if (maxwell) {
        console.log(` Maxwell encontrado: ${maxwell.nome}. Forçando patrocinador Emanuel.`);
        // Definir uma data de criação muito antiga para ele ser o 1º de Emanuel
        await supabase.from('consultores').update({
            patrocinador_id: emanuelId,
            created_at: '2024-01-01T00:00:00Z'
        }).eq('id', maxwell.id);
    }

    // 2. Limpar TODOS que ainda estejam na Rota Fácil (outroRootId)
    const { data: rfoDirects } = await supabase
        .from('consultores')
        .select('id, nome')
        .eq('patrocinador_id', otherRootId);

    for (const u of (rfoDirects || [])) {
        console.log(` Removendo ${u.nome} da raiz secundária e movendo para derramamento.`);
        // Mover para uma das contas do nível 1 (ex: Emanuel)
        await supabase.from('consultores').update({ patrocinador_id: emanuelId }).eq('id', u.id);
    }

    console.log('\n--- CORREÇÃO CONCLUÍDA ---');
}

finalCorrection();
