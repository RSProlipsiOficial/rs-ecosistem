const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findLideres() {
    const ids = ['034051dc-8742-4df4-85ff-36a01844c612', '4706b805-ca7e-46bf-a7a7-2ad5bc8c0438'];
    const { data: byIds } = await supabase.from('consultores').select('id, nome, patrocinador_id').in('id', ids);
    console.log('Busca por IDs:', byIds);

    const { data: byName } = await supabase.from('consultores').select('id, nome, patrocinador_id').or('nome.ilike.%JOAO%,nome.ilike.%MICHAEL%');
    console.log('Busca por Nomes:', byName);
}

findLideres();
