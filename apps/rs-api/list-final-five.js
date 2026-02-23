const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listFinalFive() {
    try {
        // 1. Pegar Profiles com mmn_id
        const { data: rtOwners } = await supabase
            .from('user_profiles')
            .select('id, user_id, nome_completo, mmn_id, empresa, sponsor_id')
            .not('mmn_id', 'is', null);

        // 2. Pegar os emails em Usuarios correspondentes a ESSES user_ids
        const rtUserIds = rtOwners.map(p => p.id); // No Rota Fácil, 'id' do profile parece ser o user_id do auth/usuarios
        const { data: rtUsers } = await supabase
            .from('usuarios')
            .select('id, email')
            .in('id', rtUserIds);

        console.log('--- DEFINITIVE 5 ROTA OWNERS ---');
        rtOwners.forEach(p => {
            const u = rtUsers?.find(user => user.id === p.id);
            console.log(`- ${p.nome_completo} [${u ? u.email : 'No Email'}] | MMN ID: ${p.mmn_id} | Sponsor: ${p.sponsor_id}`);
        });

        // 3. Ver se "RS Prólipsi" (Root) está nessa lista
        const rsRootId = '89c000c0-7a39-4e1e-8dee-5978d846fa89';
        const isRootInRota = rtUserIds.includes(rsRootId);
        console.log(`\nRS Prólipsi Root (${rsRootId}) está na lista da Rota?`, isRootInRota);

    } catch (error) {
        console.error('Erro:', error);
    }
}

listFinalFive();
