const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOverlap() {
    try {
        // 1. Pegar os 5 Donos da Rota (mmn_id IS NOT NULL)
        const { data: rtOwners } = await supabase
            .from('user_profiles')
            .select('id, nome_completo, mmn_id');

        // Como user_profiles não tem email, vamos buscar em usuarios
        const ownerIds = rtOwners.filter(p => p.mmn_id).map(p => p.id);
        const { data: rtUsers } = await supabase
            .from('usuarios')
            .select('id, email')
            .in('id', ownerIds);

        const ownerEmails = new Set(rtUsers.map(u => u.email.toLowerCase()));
        console.log('Emails Donos Rota (Filtered by mmn_id):', [...ownerEmails]);

        // 2. Pegar os Consultores RS
        const { data: rsCons } = await supabase
            .from('consultores')
            .select('email');

        const rsEmails = new Set(rsCons.map(c => c.email?.toLowerCase()).filter(e => e));

        // 3. Ver sobreposição
        const overlapping = [...ownerEmails].filter(e => rsEmails.has(e));
        console.log('\nEmails em AMBAS as bases:', overlapping);
        console.log('Total Consultores RS:', rsCons.length);
        console.log('Total Donos Rota:', ownerEmails.size);
        console.log('Total Unificado (Matematicamente):', rsCons.length + ownerEmails.size - overlapping.length);

    } catch (error) {
        console.error('Erro:', error);
    }
}

checkOverlap();
