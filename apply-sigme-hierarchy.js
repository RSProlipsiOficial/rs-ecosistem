const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function applyHierarchy() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const rootId = '89c000c0-7a39-4e1e-8dee-5978d846fa89'; // RS Prólipsi

    // Ids mapeados manualmente do mapped_users.json e logs anteriores
    const users = [
        { id: '179d44cd-3351-4cdb-ad1e-78ac274108c2', nome: 'Emanuel Mendes Claro', order: 1 },
        { id: 'b4d54416-119e-41f7-92c2-cde26e5e6e9f', nome: 'sidnalva maria bueno camargo', order: 2 },
        { id: 'fcab07f8-5144-4983-9fab-1576c015675f', nome: 'Oseias Silva', order: 3 },
        { id: '7720eac9-2d47-4730-86bc-8ce3fd38e886', nome: 'Marisane Antunes de lima', order: 4 },
        { id: '5203e372-c146-4232-99db-c37f08c4252e', nome: 'Rosely Monteiro', order: 5 },
        { id: 'fa05e517-f2e0-4458-aeed-97e574dc8d5d', nome: 'Júlio Galvão', order: 6 },
        { id: '1258fb1f-1f29-4ab3-bc4b-f5f59e95d996', nome: 'Laércio Montesso Gonçalves', order: 7 },
        { id: '00000000-0000-4000-a000-000000239914', nome: 'Marcos Abreu', order: 8 },
        { id: '8360d35d-d76e-4177-910f-49f22b9da233', nome: 'Geraldo Carvalho Costa', order: 9 },
        { id: 'cac9b785-c854-49d2-89ec-b2bf8986132f', nome: 'Kaue Moreira', order: 10 },
        { id: '54442021-1dd1-47ac-92a6-dc732b9433f7', nome: 'Edinelson Manoel Dos Santos', order: 11 },
        { id: '00000000-0000-4000-a000-0000008df3f5', nome: 'Pedro Henrique', order: 12 },
        { id: '00000000-0000-4000-a000-0000005b416a', nome: 'Rafael Alves Guido', order: 13 },
        { id: '00000000-0000-4000-a000-0000005a35f6', nome: 'Tiago Santos Miranda', order: 14 },
        { id: '00000000-0000-4000-a000-0000004853b8', nome: 'Odair Luna', order: 15 },
        { id: '00000000-0000-4000-a000-0000006a38ba', nome: 'Salvador dos Reus', order: 16 },
        { id: '00000000-0000-4000-a000-000000107f54', nome: 'Francisco das chagas Pereira Araujo', order: 17 }
    ];

    console.log('--- APLICANDO HIERARQUIA SIGME ---');

    // 1. Definir os 6 primeiros como Nível 1 (Diretos da Raiz)
    const level1Slots = users.slice(0, 6);
    for (const u of level1Slots) {
        console.log(`Configurando Nível 1: ${u.nome} -> Root`);
        await supabase.from('consultores').update({ patrocinador_id: rootId }).eq('id', u.id);
    }

    // 2. Distribuir os 11 restantes em "Escada" sob os 6 do Nível 1
    const spilloverUsers = users.slice(6);
    for (let i = 0; i < spilloverUsers.length; i++) {
        const targetSponsor = level1Slots[i % 6];
        const u = spilloverUsers[i];
        console.log(`Spillover (Escada): ${u.nome} -> ${targetSponsor.nome}`);
        await supabase.from('consultores').update({ patrocinador_id: targetSponsor.id }).eq('id', u.id);
    }

    console.log('\n--- OPERAÇÃO CONCLUÍDA ---');
}

applyHierarchy();
