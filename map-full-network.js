const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function mapFullNetworkSize() {
    console.log('--- TAMANHO TOTAL DA REDE POR CONSULTOR ---');

    const { data: all } = await supabase.from('consultores').select('id, nome, patrocinador_id');

    const childrenMap = {};
    all.forEach(c => {
        if (c.patrocinador_id) {
            if (!childrenMap[c.patrocinador_id]) childrenMap[c.patrocinador_id] = [];
            childrenMap[c.patrocinador_id].push(c.id);
        }
    });

    function countDescendants(id) {
        const children = childrenMap[id] || [];
        let count = children.length;
        for (const childId of children) {
            count += countDescendants(childId);
        }
        return count;
    }

    const results = all.map(c => ({
        nome: c.nome,
        id: c.id,
        descendants: countDescendants(c.id)
    }));

    const top = results.sort((a, b) => b.descendants - a.descendants).slice(0, 30);

    top.forEach(t => {
        console.log(`${t.nome} (ID: ${t.id}) -> Total na Rede: ${t.descendants}`);
    });
}

mapFullNetworkSize();
