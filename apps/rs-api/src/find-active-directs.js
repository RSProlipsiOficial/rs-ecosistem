const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findActiveDirects() {
    const userId = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
    
    // 1. Quem são os diretos?
    const { data: directs } = await supabase
        .from('consultores')
        .select('id, nome, status, email')
        .eq('patrocinador_id', userId);

    console.log(`\n👥 Consultores com patrocinador_id = ${userId} (${directs?.length || 0}):`);
    for (const d of directs || []) {
        const { data: acc } = await supabase.from('matrix_accumulator').select('*').eq('consultor_id', d.id).maybeSingle();
        console.log(`- ${d.nome} | Email: ${d.email} | Status: ${d.status} | Acc: R$ ${acc?.accumulated_value || 0}`);
    }

    // 2. Verificar se Roberto Camargo é um dos diretos
    const { data: roberto } = await supabase.from('consultores').select('*').ilike('nome', '%Roberto Camargo%').maybeSingle();
    if (roberto) {
        console.log(`\n👤 Roberto Camargo (${roberto.id}) Patrocinador: ${roberto.patrocinador_id}`);
    }
}

findActiveDirects().catch(console.error);
