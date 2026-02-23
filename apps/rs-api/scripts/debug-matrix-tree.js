require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

async function main() {
    const rootId = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

    // 1. Buscar root
    const { data: root } = await supabase
        .from('consultores')
        .select('id, nome, username, pin_atual, status, created_at, patrocinador_id, whatsapp, email, user_id')
        .or(`id.eq.${rootId},user_id.eq.${rootId}`)
        .maybeSingle();

    console.log('ROOT:', root.nome, '| id:', root.id, '| patrocinador_id:', root.patrocinador_id);

    // 2. Buscar TODOS os consultores (mesma query que matrix.routes.ts)
    const { data: allConsultants, error } = await supabase
        .from('consultores')
        .select('id, user_id, nome, username, pin_atual, status, created_at, patrocinador_id, whatsapp, email')
        .neq('id', root.patrocinador_id || 'NONE')
        .order('created_at', { ascending: true });

    console.log('Total consultores carregados:', allConsultants?.length || 0);
    if (error) console.error('ERRO:', error.message);

    // 3. Simular buildMatrixIterative
    const treeMap = new Map();
    const rootNode = {
        id: root.id,
        name: root.nome,
        username: root.username,
        children: []
    };
    treeMap.set(rootNode.id, rootNode);

    let placed = 0;
    let skippedUpline = 0;
    let skippedNoSponsor = 0;
    let skippedSelf = 0;

    // isInUplineChain - mesma lógica do backend
    const isInUplineChain = (personId, personUsername) => {
        let currentPatrocinadorId = root.patrocinador_id;
        for (let i = 0; i < 20; i++) {
            if (!currentPatrocinadorId) break;
            if (personId === currentPatrocinadorId || personUsername === currentPatrocinadorId) {
                return true;
            }
            const upline = allConsultants.find(c =>
                c.id === currentPatrocinadorId || c.username === currentPatrocinadorId
            );
            if (!upline) break;
            currentPatrocinadorId = upline.patrocinador_id;
        }
        return false;
    };

    allConsultants.forEach(person => {
        if (person.id === rootNode.id) {
            skippedSelf++;
            return;
        }

        const isUpline = isInUplineChain(person.id, person.username);
        if (isUpline) {
            skippedUpline++;
            return;
        }

        // Buscar patrocinador na árvore
        let sponsorNode = treeMap.get(person.patrocinador_id);
        if (!sponsorNode) {
            // Fallback por username
            for (const node of treeMap.values()) {
                if (node.username === person.patrocinador_id) {
                    sponsorNode = node;
                    break;
                }
            }
        }

        if (!sponsorNode) {
            skippedNoSponsor++;
            return;
        }

        // Colocar — BFS balanceado
        let currentLevelNodes = [sponsorNode];
        let placedHere = false;

        while (currentLevelNodes.length > 0 && !placedHere) {
            const candidates = currentLevelNodes.filter(n => n.children.length < 6);
            if (candidates.length > 0) {
                candidates.sort((a, b) => a.children.length - b.children.length);
                const bestParent = candidates[0];

                const newNode = {
                    id: person.id,
                    name: person.nome,
                    username: person.username,
                    children: []
                };

                bestParent.children.push(newNode);
                treeMap.set(newNode.id, newNode);
                placed++;
                placedHere = true;
            } else {
                const nextLevel = [];
                currentLevelNodes.forEach(n => nextLevel.push(...n.children));
                currentLevelNodes = nextLevel;
            }
        }
    });

    console.log('\n=== RESULTADO DA SIMULAÇÃO ===');
    console.log('Colocados na árvore:', placed);
    console.log('Excluídos (self):', skippedSelf);
    console.log('Excluídos (upline):', skippedUpline);
    console.log('Excluídos (sem patrocinador na árvore):', skippedNoSponsor);

    console.log('\nFilhos diretos do ROOT:', rootNode.children.length);
    rootNode.children.forEach(c => console.log(`  - ${c.name}`));

    process.exit(0);
}

main();
