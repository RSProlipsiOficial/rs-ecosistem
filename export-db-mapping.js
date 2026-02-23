const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });
const fs = require('fs');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function exportCPFs() {
    const { data, error } = await supabase
        .from('consultores')
        .select('id, nome, cpf');

    if (error) {
        console.error(error);
        return;
    }

    const mapping = data.map(c => ({
        id: c.id,
        nome: c.nome,
        cpf: c.cpf
    }));

    fs.writeFileSync('db-consultants-mapping.json', JSON.stringify(mapping, null, 2));
    console.log(`Exportados ${mapping.length} consultores do banco.`);
}

exportCPFs();
