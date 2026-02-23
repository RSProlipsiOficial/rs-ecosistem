const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAllProfiles() {
    try {
        const { data: profiles, error } = await supabase
            .from('user_profiles')
            .select('id, nome_completo, sponsor_id, mmn_id')
            .order('nome_completo', { ascending: true });

        if (error) throw error;

        console.log('--- RELATÓRIO TOTAL DE PERFIS ROTA FÁCIL ---');
        console.log('Total:', profiles.length);
        console.log('---------------------------------------------');

        profiles.forEach(p => {
            if (p.mmn_id) {
                console.log(`[!] DONO: ${p.nome_completo} | MMN ID: ${p.mmn_id} | Sponsor: ${p.sponsor_id} | ID: ${p.id}`);
            } else {
                // Comentar para não poluir, ou mostrar apenas os que têm sponsor_id
                // console.log(`- ${p.nome_completo} | Sponsor: ${p.sponsor_id}`);
            }
        });

        // Se não achar "Aryn", buscar por trechos
        const arynSearch = profiles.filter(p => p.nome_completo?.toLowerCase().includes('aryn'));
        console.log('\nBusca por "Aryn":', arynSearch);

        const xSearch = profiles.filter(p => p.mmn_id?.toLowerCase().includes('roberto'));
        console.log('\nBusca por MMN "roberto":', xSearch);

    } catch (error) {
        console.error(error);
    }
}

listAllProfiles();
