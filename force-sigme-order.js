const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'apps/rs-api/.env') });

const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const rootId = '89c000c0-7a39-4e1e-8dee-5978d846fa89';

const priorities = [
    { id: '179d44cd-3351-4cdb-ad1e-78ac274108c2', name: 'Emanuel', date: '2024-01-01T10:00:00Z', sponsor: rootId },
    { id: 'b4d54416-119e-41f7-92c2-cde26e5e6e9f', name: 'Sidinalva', date: '2024-01-01T11:00:00Z', sponsor: rootId },
    { id: 'fcab07f8-5144-4983-9fab-1576c015675f', name: 'Oseias', date: '2024-01-01T12:00:00Z', sponsor: rootId },
    { id: '7720eac9-2d47-4730-86bc-8ce3fd38e886', name: 'Marisane', date: '2024-01-01T13:00:00Z', sponsor: rootId },
    { id: '5203e372-c146-4232-99db-c37f08c4252e', name: 'Rosely', date: '2024-01-01T14:00:00Z', sponsor: rootId },
    { id: 'fa05e517-f2e0-4458-aeed-97e574dc8d5d', name: 'Júlio Galvão', date: '2024-01-01T15:00:00Z', sponsor: rootId }
];

async function applyForce() {
    console.log('--- FORÇANDO ORDEM FIFO DETERMINÍSTICA ---');

    // 1. Configurar Top 6 na Raiz com datas muito antigas
    for (const u of priorities) {
        console.log(` Configurando ${u.name} no Nível 1...`);
        await s.from('consultores').update({
            patrocinador_id: u.sponsor,
            created_at: u.date
        }).eq('id', u.id);
    }

    // 2. Maxwell (1º do Emanuel)
    const emanuelId = '179d44cd-3351-4cdb-ad1e-78ac274108c2';
    const { data: maxwell } = await s.from('consultores').select('id').ilike('nome', '%maxwel%').single();
    if (maxwell) {
        console.log(` Configurando Maxwell como 1º de Emanuel...`);
        await s.from('consultores').update({
            patrocinador_id: emanuelId,
            created_at: '2024-01-02T00:00:00Z' // Justo após o top 6
        }).eq('id', maxwell.id);
    }

    // 3. Mover intrusos (Sérgio, Marcos, Canal) para baixo do Emanuel ou outros
    const intruders = [
        { name: '%Sérgio Filgueiras%', target: emanuelId },
        { name: '%Marcos Lima Rovaris%', target: emanuelId },
        { name: '%Audicir Canal%', target: emanuelId }
    ];

    for (const i of intruders) {
        const { data } = await s.from('consultores').select('id, nome').ilike('nome', i.name).select();
        for (const found of (data || [])) {
            console.log(` Movendo intruso ${found.nome} para Nível 2 (Emanuel)...`);
            await s.from('consultores').update({
                patrocinador_id: i.target,
                created_at: '2025-12-30T00:00:00Z' // Data recente para ser derramamento
            }).eq('id', found.id);
        }
    }

    console.log('\n--- OPERAÇÃO CONCLUÍDA ---');
}

applyForce();
