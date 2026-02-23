const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function fixRootHierarchy() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const rootIds = ['89c000c0-7a39-4e1e-8dee-5978d846fa89', 'd107da4e-e266-41b0-947a-0c66b2f2b9ef'];

    // Top 6 Oficiais (Ordem Prioritária)
    const top6 = [
        { id: '179d44cd-3351-4cdb-ad1e-78ac274108c2', nome: 'Emanuel Mendes Claro' },
        { id: 'fcab07f8-5144-4983-9fab-1576c015675f', nome: 'Oseias Silva' },
        { id: 'b4d54416-119e-41f7-92c2-cde26e5e6e9f', nome: 'Sidinalva Maria Bueno Camargo' },
        { id: '5203e372-c146-4232-99db-c37f08c4252e', nome: 'Rosely Monteiro' },
        { id: '7720eac9-2d47-4730-86bc-8ce3fd38e886', nome: 'Marisane Antunes de lima' },
        { id: 'fa05e517-f2e0-4458-aeed-97e574dc8d5d', nome: 'Júlio Galvão' }
    ];

    const top6Ids = top6.map(u => u.id);

    console.log('--- BUSCANDO TODOS OS DIRETOS DAS RAÍZES ---');
    const { data: allDirects, error } = await supabase
        .from('consultores')
        .select('id, nome, patrocinador_id')
        .in('patrocinador_id', rootIds);

    if (error) {
        console.error('Erro ao buscar diretos:', error);
        return;
    }

    // Filtrar quem não é Top 6
    const intruders = (allDirects || []).filter(u => !top6Ids.includes(u.id));
    console.log(`Encontrados ${intruders.length} usuários extras para redistribuir.`);

    // Garantir que os Top 6 estão vinculados à raiz correta (89c... - RS Prólipsi)
    for (const u of top6) {
        console.log(`Fixando no Nível 1: ${u.nome}`);
        await supabase.from('consultores').update({ patrocinador_id: rootIds[0] }).eq('id', u.id);
    }

    // Redistribuir intrusos em escada sob o Top 6
    for (let i = 0; i < intruders.length; i++) {
        const targetSponsor = top6[i % 6];
        const u = intruders[i];
        console.log(`Movendo para Nível 2 (Derramamento): ${u.nome} -> ${targetSponsor.nome}`);
        await supabase.from('consultores').update({ patrocinador_id: targetSponsor.id }).eq('id', u.id);
    }

    console.log('\n--- REDISTRIBUIÇÃO CONCLUÍDA ---');
}

fixRootHierarchy();
