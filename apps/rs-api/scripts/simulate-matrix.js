const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function simulateMatrixAPI() {
    console.log('\n🧪 SIMULANDO LÓGICA DA MATRIZ (Versão CORRIGIDA)\n');
    console.log('='.repeat(70));

    const emanuelId = '179d44cd-3351-4cdb-ad1e-78ac274108c2';

    // 1. Buscar root (como na API corrigida - agora inclui patrocinador_id)
    const { data: root } = await supabase
        .from('consultores')
        .select('id, nome, email, username, pin_atual, status, created_at, whatsapp, patrocinador_id')
        .eq('id', emanuelId)
        .single();

    console.log('📋 ROOT:', root.nome);
    console.log('  patrocinador_id:', root.patrocinador_id);
    console.log('');

    // 2. Buscar consultores (como na API corrigida - exclui patrocinador direto)
    const { data: allConsultants } = await supabase
        .from('consultores')
        .select('id, user_id, nome, username, pin_atual, status, created_at, patrocinador_id, whatsapp, email')
        .neq('id', root.patrocinador_id || 'NONE')
        .order('created_at', { ascending: true });

    console.log(`📊 Total consultores carregados: ${allConsultants?.length || 0}`);

    // Verificar se Rota Fácil foi excluída pela query
    const rotaInList = allConsultants?.find(c => c.nome?.toLowerCase().includes('rota') && c.nome?.toLowerCase().includes('cil'));
    if (rotaInList) {
        console.log('⚠️  ROTA FÁCIL AINDA NA LISTA:', rotaInList.nome, rotaInList.id);
    } else {
        console.log('✅ ROTA FÁCIL EXCLUÍDA DA QUERY (Sucesso!)');
    }
    console.log('');

    // 3. Simular isInUplineChain
    const isInUplineChain = (personId, personUsername) => {
        let currentPatrocinadorId = root.patrocinador_id;
        for (let i = 0; i < 20; i++) {
            if (!currentPatrocinadorId) break;
            if (personId === currentPatrocinadorId || personUsername === currentPatrocinadorId) return true;
            const uplineConsultant = allConsultants?.find(c =>
                c.id === currentPatrocinadorId || c.username === currentPatrocinadorId
            );
            if (!uplineConsultant) break;
            currentPatrocinadorId = uplineConsultant.patrocinador_id;
        }
        return false;
    };

    // 4. Simular BFS
    const treeMap = new Map();
    const rootNode = { id: root.id, name: root.nome, username: root.username, children: [], level: 0 };
    treeMap.set(rootNode.id, rootNode);
    if (root.username) treeMap.set(root.username, rootNode);

    let addedCount = 0;
    let skippedUpline = 0;
    let skippedNoSponsor = 0;

    allConsultants?.forEach(person => {
        if (person.id === rootNode.id) return;

        // Upline check
        if (isInUplineChain(person.id, person.username)) {
            skippedUpline++;
            console.log(`  🚫 UPLINE EXCLUÍDO: ${person.nome}`);
            return;
        }

        // Find sponsor in tree
        let sponsorNode = treeMap.get(person.patrocinador_id);
        if (!sponsorNode) {
            for (const node of treeMap.values()) {
                if (node.username === person.patrocinador_id) {
                    sponsorNode = node;
                    break;
                }
            }
        }

        if (sponsorNode) {
            // Add to tree (simplified - no 6 limit for this test)
            const newNode = { id: person.id, name: person.nome, username: person.username, children: [], level: sponsorNode.level + 1 };
            sponsorNode.children.push(newNode);
            treeMap.set(person.id, newNode);
            if (person.username) treeMap.set(person.username, newNode);
            addedCount++;
        } else {
            skippedNoSponsor++;
        }
    });

    console.log(`\n📊 RESULTADO:`);
    console.log(`  Adicionados à árvore: ${addedCount}`);
    console.log(`  Uplines excluídos: ${skippedUpline}`);
    console.log(`  Sem patrocinador na árvore: ${skippedNoSponsor}`);
    console.log('');

    // 5. Mostrar filhos diretos do root
    console.log('👶 FILHOS DIRETOS DO ROOT:');
    rootNode.children.forEach((child, i) => {
        const flag = child.name?.toLowerCase().includes('rota') ? ' ⚠️ BUG!' : '';
        console.log(`  ${i + 1}. ${child.name}${flag}`);
    });

    console.log('\n' + '='.repeat(70));
}

simulateMatrixAPI()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Erro:', err);
        process.exit(1);
    });
