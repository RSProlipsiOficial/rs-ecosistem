
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/rs-api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function run() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Root ID (RS Prólipsi)
    const rootId = '89c000c0-7a39-4e1e-8dee-5978d846fa89';

    const { data: directRef, error } = await supabase
        .from('consultores')
        .select('id, nome, email, created_at')
        .eq('patrocinador_id', rootId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Erro:', error);
        return;
    }

    console.log('Total de indicados diretos no consultores:', directRef.length);
    if (directRef.length > 0) {
        console.table(directRef);
    }
}
run();
