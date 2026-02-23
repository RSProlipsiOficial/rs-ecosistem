const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/rs-api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function run() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const targetId = '89c000c0-7a39-4e1e-8dee-5978d846fa89'; // RS Prólipsi

    console.log(`--- VERIFICANDO SE RS PRÓLIPSI É FILHA DE ALGUÉM ---`);

    const { data, error } = await supabase
        .from('downlines')
        .select('upline_id, nivel')
        .eq('downline_id', targetId);

    if (error) {
        console.error(error);
        return;
    }

    if (data.length === 0) {
        console.log('Não é downline de ninguém nas tabelas.');
    } else {
        console.table(data);
    }
}
run();
