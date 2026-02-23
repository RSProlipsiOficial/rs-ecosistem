const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/rs-api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function run() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const rootId = '89c000c0-7a39-4e1e-8dee-5978d846fa89'; // RS Prólipsi

    console.log(`--- UNIFICANDO HIERARQUIA SOB RS PRÓLIPSI (${rootId}) ---`);

    // 1. Buscar todos os consultores que não têm patrocinador (exceto a própria raiz)
    const { data: masters, error: fetchError } = await supabase
        .from('consultores')
        .select('id, nome')
        .is('patrocinador_id', null)
        .neq('id', rootId);

    if (fetchError) {
        console.error('Erro ao buscar mestres:', fetchError);
        return;
    }

    console.log(`Encontrados ${masters.length} consultores mestre para vincular.`);

    for (const master of masters) {
        console.log(`Vinculando ${master.nome} (${master.id}) como indicado de RS Prólipsi...`);

        const { error: updateError } = await supabase
            .from('consultores')
            .update({ patrocinador_id: rootId })
            .eq('id', master.id);

        if (updateError) {
            console.error(`Falha ao vincular ${master.nome}:`, updateError);
        } else {
            console.log(`Sucesso! ${master.nome} agora é downline da RS Prólipsi.`);
        }
    }

    console.log('--- OPERAÇÃO CONCLUÍDA ---');
}
run();
