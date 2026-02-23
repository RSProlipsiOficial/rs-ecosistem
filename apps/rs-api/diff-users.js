const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function diffUsers() {
    try {
        // 1. Pegar IDs em Consultores
        const { data: cons } = await supabase.from('consultores').select('id, nome');
        const consIds = new Set(cons?.map(c => c.id));

        // 2. Pegar IDs em Usuarios (Rota Fácil)
        const { data: users } = await supabase.from('usuarios').select('id, patrocinador_id');

        console.log('--- DIFERENÇA USUARIOS ---');
        const exclusiveRota = users?.filter(u => !consIds.has(u.id));
        console.log('Total Exclusivo Rota Fácil:', exclusiveRota?.length);

        if (exclusiveRota && exclusiveRota.length > 0) {
            const ids = exclusiveRota.map(u => u.id);
            const { data: profs } = await supabase
                .from('user_profiles')
                .select('user_id, nome_completo, created_at')
                .in('user_id', ids);

            console.log('\nPerfis Exclusivos Rota Fácil:');
            console.log(profs);
            console.log('\nPatrocinadores desses perfis:');
            exclusiveRota.forEach(u => {
                const p = profs?.find(prof => prof.user_id === u.id);
                console.log(`- ${p ? p.nome_completo : u.id} -> Patroc: ${u.patrocinador_id}`);
            });
        }

    } catch (error) {
        console.error('Erro:', error);
    }
}

diffUsers();
