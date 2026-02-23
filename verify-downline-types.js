const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/rs-api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function run() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const targetId = '89c000c0-7a39-4e1e-8dee-5978d846fa89';

    const { data: matrixDownlines } = await supabase
        .from('downlines')
        .select('*')
        .eq('upline_id', targetId);

    console.log(`Matriz Downlines for ${targetId}:`, matrixDownlines.length);
    console.table(matrixDownlines);

    const { data: unilevelDownlines } = await supabase
        .from('consultores')
        .select('id, nome, status')
        .eq('patrocinador_id', targetId);

    console.log(`Unilevel Downlines for ${targetId}:`, unilevelDownlines.length);
    console.table(unilevelDownlines);
}
run();
