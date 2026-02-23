
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Erro: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAdminTreeLogic() {
    console.log('--- Testando Lógica da Árvore Admin (Simulação) ---');

    // 1. Identificar Root
    const OFFICIAL_EMAIL = 'rsprolipsioficial@gmail.com';
    console.log(`Buscando root por email: ${OFFICIAL_EMAIL}`);

    let rootNode = null;
    const { data: rootByEmail } = await supabase
        .from('consultores')
        .select('id, nome, email, username')
        .eq('email', OFFICIAL_EMAIL)
        .maybeSingle();

    if (rootByEmail) {
        console.log('✅ Root encontrado por email:', rootByEmail.nome, `(${rootByEmail.id})`);
        rootNode = rootByEmail;
    } else {
        console.log('❌ Root não encontrado por email. Tentando fallback ID...');
        const KNOWN_ROOT_ID = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
        const { data: rootById } = await supabase
            .from('consultores')
            .select('id, nome, email, username')
            .eq('id', KNOWN_ROOT_ID)
            .maybeSingle();

        if (rootById) {
            console.log('✅ Root encontrado por ID:', rootById.nome, `(${rootById.id})`);
            rootNode = rootById;
        } else {
            console.error('❌ Root não encontrado de jeito nenhum.');
            return;
        }
    }

    // 2. Carregar TODOS
    console.log('Carregando todos os consultores...');
    const { data: allConsultants, error } = await supabase
        .from('consultores')
        .select('id, nome, email, username, patrocinador_id, whatsapp');

    if (error) {
        console.error('Erro ao carregar consultores:', error);
        return;
    }
    console.log(`✅ Carregados ${allConsultants.length} consultores.`);

    // 3. Montar Árvore (Profundidade 2 apenas para teste)
    const depth = 2;
    const rootId = rootNode.id;

    const buildTreeInMemory = (parentId, currentLevel) => {
        if (currentLevel > depth) return null;

        const children = allConsultants.filter(c => {
            // Vínculo Híbrido
            if (c.patrocinador_id === parentId) return true;
            const parent = allConsultants.find(p => p.id === parentId);
            if (parent && parent.username && c.patrocinador_id === parent.username) return true;
            return false;
        });

        return {
            id: parentId,
            name: allConsultants.find(c => c.id === parentId)?.nome,
            email: allConsultants.find(c => c.id === parentId)?.email,
            childrenCount: children.length,
            children: children.map(child => buildTreeInMemory(child.id, currentLevel + 1)).filter(Boolean)
        };
    };

    const tree = buildTreeInMemory(rootId, 0);

    // 4. Output
    console.log('\n--- Resultado da Árvore Gerada ---');
    console.log(`Root: ${tree.name} (${tree.email})`);
    console.log(`Filhos Diretos: ${tree.childrenCount}`);

    if (tree.childrenCount > 0) {
        tree.children.forEach(c => {
            console.log(`  - Filho L1: ${c.name} (${c.childrenCount} netos)`);
            if (c.childrenCount > 0) {
                c.children.forEach(n => {
                    console.log(`    - Neto L2: ${n.name}`);
                });
            }
        });
    } else {
        console.log('⚠️ ALERTA: Root não tem filhos! A lógica falhou ou os dados estão desconectados.');
    }
}

testAdminTreeLogic();
