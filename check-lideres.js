const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkLideres() {
    const names = ['João Miranda', 'Michael Medeiros', 'Emanuel Mendes'];

    for (const name of names) {
        const { data, error } = await supabase
            .from('consultores')
            .select('id, nome, patrocinador_id')
            .ilike('nome', `%${name}%`);

        if (data) {
            data.forEach(c => {
                console.log(`Líder: ${c.nome} | ID: ${c.id} | Patrocinador: ${c.patrocinador_id}`);
            });
        }
    }
}

checkLideres();
