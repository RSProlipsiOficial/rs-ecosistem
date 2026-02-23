const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/rs-api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function run() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 5. Buscar Cleuci e seu patrocinador
    const { data: cleuci } = await supabase
        .from('consultores')
        .select('id, nome, patrocinador_id, username')
        .eq('id', '8abec405-818a-4e14-8c71-72ec7a718f89')
        .single();

    if (cleuci) {
        console.log(`👤 Dados da Cleuci: Nome: ${cleuci.nome} | ID: ${cleuci.id} | Patrocinador ID: ${cleuci.patrocinador_id}`);
        if (cleuci.patrocinador_id) {
            const { data: sponsor } = await supabase.from('consultores').select('id, nome').eq('id', cleuci.patrocinador_id).single();
            console.log(`   👉 Patrocinador encontrado: ${sponsor?.nome || 'Não encontrado'}`);
        } else {
            console.log('   👉 Cleuci NÃO tem patrocinador (é um root).');
        }
    } else {
        console.log('❌ Cleuci não encontrada.');
    }
}

run();
