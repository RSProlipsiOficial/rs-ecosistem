const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verify() {
    const checkList = [
        { name: 'RS Prólipsi', id: '89c000c0-7a39-4e1e-8dee-5978d846fa89' },
        { name: 'Emanuel Mendes Claro', id: '179d44cd-3351-4cdb-ad1e-78ac274108c2' },
        { name: 'maxwel santos', id: '69806370-f06e-4c5f-b728-f96410a6f462' },
        { name: 'joão josé oliveira miranda', id: '034051dc-8742-4df4-85ff-36a01844c612' },
        { name: 'Michael De Araújo Medeiros', id: '4706b805-ca7e-46bf-a7a7-2ad5bc8c0438' }
    ];

    console.log('--- Verificação Final de Hierarquia ---');

    for (const c of checkList) {
        const { data, count } = await supabase
            .from('consultores')
            .select('id', { count: 'exact', head: true })
            .eq('patrocinador_id', c.id);

        console.log(`${c.name}: ${count} indicados diretos.`);
    }
}

verify();
