const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/rs-api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function run() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const leaders = [
        '4706b805-ca7e-46bf-a7a7-2ad5bc8c0438', // Michael
        'd107da4e-e266-41b0-947a-0c66b2f2b9ef'  // Rota Fácil Oficial
    ];

    console.log(`--- VERIFICANDO PATROCINADORES DOS LÍDERES ---`);

    const { data: consultants, error } = await supabase
        .from('consultores')
        .select('id, nome, patrocinador_id')
        .in('id', leaders);

    console.table(consultants);

    // Agora vamos ver quem não tem patrocinador (Raiz real)
    const { data: roots } = await supabase
        .from('consultores')
        .select('id, nome, patrocinador_id')
        .is('patrocinador_id', null);

    console.log('Consultores sem patrocinador (Raízes em potencial):');
    console.table(roots);
}
run();
