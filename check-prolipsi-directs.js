const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'apps/rs-api/.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
    const rootId = '89c000c0-7a39-4e1e-8dee-5978d846fa89';
    const { data, error } = await supabase
        .from('consultores')
        .select('id, nome, status, patrocinador_id')
        .eq('patrocinador_id', rootId);

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Total de indicados diretos reais da RS Prólipsi: ${data.length}`);
    data.forEach(c => {
        console.log(`- ${c.nome} (Status: ${c.status})`);
    });
}

run();
