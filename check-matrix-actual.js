const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/rs-api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function run() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const targetId = '89c000c0-7a39-4e1e-8dee-5978d846fa89';

    console.log(`--- VERIFICANDO MATRIZ (downlines) PARA: ${targetId} ---`);

    const { data: downlines, error } = await supabase
        .from('downlines')
        .select('*')
        .eq('id_patrocinador', targetId);

    if (error) {
        console.error('Erro:', error);
        return;
    }

    console.log(`Total na matriz: ${downlines.length}`);
    console.table(downlines);
}
run();
