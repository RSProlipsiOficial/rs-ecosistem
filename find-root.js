
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/rs-api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function run() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: root, error } = await supabase
        .from('consultores')
        .select('id, nome, email')
        .or('nome.ilike.%PRÓLIPSI%,patrocinador_id.is.null')
        .limit(10);

    if (error) {
        console.error('Erro:', error);
        return;
    }
    console.log('--- CONSULTORES MASTER ENCONTRADOS ---');
    console.table(root);
}
run();
