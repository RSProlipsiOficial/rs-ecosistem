const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'apps/rs-api/.env') });

const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const rootId = '89c000c0-7a39-4e1e-8dee-5978d846fa89'; // RS Prólipsi
const rfoId = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef'; // Rota Fácil Oficial
const emanuelId = '179d44cd-3351-4cdb-ad1e-78ac274108c2';

const OFICIAIS = [
    '179d44cd-3351-4cdb-ad1e-78ac274108c2', // Emanuel
    'b4d54416-119e-41f7-92c2-cde26e5e6e9f', // Sidinalva
    'fcab07f8-5144-4983-9fab-1576c015675f', // Oseias
    '7720eac9-2d47-4730-86bc-8ce3fd38e886', // Marisane
    '5203e372-c146-4232-99db-c37f08c4252e', // Rosely
    'fa05e517-f2e0-4458-aeed-97e574dc8d5d'  // Júlio
];

async function purgeRoot() {
    console.log('--- PURGAÇÃO TOTAL DO NÍVEL 1 (ROOT) ---');

    // 1. Buscar TODOS os diretos de ambas as raízes
    const { data: directs } = await s
        .from('consultores')
        .select('id, nome, patrocinador_id')
        .in('patrocinador_id', [rootId, rfoId]);

    console.log(`Encontrados ${directs?.length || 0} diretos nas raízes.`);

    for (const u of (directs || [])) {
        if (!OFICIAIS.includes(u.id)) {
            console.log(` [REMOVENDO] ${u.nome} da raiz -> movendo para Emanuel.`);
            await s.from('consultores').update({
                patrocinador_id: emanuelId,
                created_at: '2025-12-31T23:59:59Z' // Data recente para ser derramamento
            }).eq('id', u.id);
        } else {
            console.log(` [MANTENDO] ${u.nome} (Oficial)`);
        }
    }

    // 2. Garantir timestamps dos Oficiais
    const dates = [
        '2024-01-01T10:00:00Z',
        '2024-01-01T11:00:00Z',
        '2024-01-01T12:00:00Z',
        '2024-01-01T13:00:00Z',
        '2024-01-01T14:00:00Z',
        '2024-01-01T15:00:00Z'
    ];

    for (let i = 0; i < OFICIAIS.length; i++) {
        await s.from('consultores').update({
            patrocinador_id: rootId,
            created_at: dates[i]
        }).eq('id', OFICIAIS[i]);
    }

    // 3. Maxwell (Forçar em 2024 pra ser o 1º de Emanuel)
    const { data: maxwell } = await s.from('consultores').select('id').ilike('nome', '%maxwel%').single();
    if (maxwell) {
        await s.from('consultores').update({
            patrocinador_id: emanuelId,
            created_at: '2024-01-02T00:00:00Z'
        }).eq('id', maxwell.id);
    }

    console.log('\n--- PURGAÇÃO CONCLUÍDA ---');
}

purgeRoot();
