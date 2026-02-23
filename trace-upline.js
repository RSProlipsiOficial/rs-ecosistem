const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/rs-api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function run() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    let currentId = '69806370-f06e-4c5f-b728-f96410a6f462'; // Maxwel Santos
    console.log('--- RASTREANDO LINHAGEM PARA CIMA ---');

    while (currentId) {
        const { data: consultant, error } = await supabase
            .from('consultores')
            .select('id, nome, patrocinador_id')
            .eq('id', currentId)
            .single();

        if (error || !consultant) {
            console.log('Fim da linhagem ou erro.');
            break;
        }

        console.log(`Consultor: ${consultant.nome} (${consultant.id}) -> Patrocinado por: ${consultant.patrocinador_id || 'RAIZ'}`);
        currentId = consultant.patrocinador_id;
    }
}
run();
