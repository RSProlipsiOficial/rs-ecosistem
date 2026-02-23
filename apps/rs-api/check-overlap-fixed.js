const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOverlapFixed() {
    try {
        // 1. Pegar todos da Usuarios (que tem email)
        const { data: rtUsers } = await supabase.from('usuarios').select('id, email');
        const rtMap = new Map(rtUsers?.map(u => [u.id, u.email?.toLowerCase()]) || []);

        // 2. Pegar os 5 Donos (Profiles com mmn_id)
        const { data: rtOwners } = await supabase
            .from('user_profiles')
            .select('id, nome_completo, mmn_id')
            .not('mmn_id', 'is', null);

        const ownerEmails = new Set(rtOwners.map(p => rtMap.get(p.id)).filter(e => e));
        console.log('Emails Donos Rota (Filtro mmn_id):', [...ownerEmails]);

        // 3. Pegar os Consultores RS
        const { data: rsCons } = await supabase.from('consultores').select('email');
        const rsEmails = new Set(rsCons.map(c => c.email?.toLowerCase()).filter(e => e));

        // 4. Ver sobreposição
        const overlapping = [...ownerEmails].filter(e => rsEmails.has(e));
        console.log('\nEmails em AMBAS as bases:', overlapping);
        console.log('Total Consultores RS:', rsCons.length);
        console.log('Total Donos Rota (Unicos):', ownerEmails.size);
        console.log('Total Unificado Real:', rsCons.length + ownerEmails.size - overlapping.length);

    } catch (error) {
        console.error('Erro:', error);
    }
}

checkOverlapFixed();
