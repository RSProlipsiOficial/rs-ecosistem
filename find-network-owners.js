const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findNetworkOwners() {
    const { data: all } = await supabase.from('consultores').select('id, nome, patrocinador_id');

    const sponsorMap = {};
    all.forEach(u => {
        if (u.patrocinador_id) {
            if (!sponsorMap[u.patrocinador_id]) sponsorMap[u.patrocinador_id] = [];
            sponsorMap[u.patrocinador_id].push(u.id);
        }
    });

    function getTreeSize(id, visited = new Set()) {
        if (visited.has(id)) return 0;
        visited.add(id);
        const kids = sponsorMap[id] || [];
        let count = kids.length;
        for (const kId of kids) {
            count += getTreeSize(kId, visited);
        }
        return count;
    }

    const results = all.map(u => ({
        name: u.nome,
        id: u.id,
        pid: u.patrocinador_id,
        size: getTreeSize(u.id)
    }));

    console.log('--- USUÁRIOS COM REDE SIGNIFICATIVA (> 10) ---');
    results.filter(r => r.size > 10).sort((a, b) => b.size - a.size).forEach(r => {
        console.log(`${r.name} (${r.id}) -> Rede: ${r.size}. Patrocinador ID: ${r.pid}`);
    });

    console.log('\n--- IDENTIFICANDO ID DESCONHECIDO ---');
    const { data: target } = await supabase.from('consultores').select('nome').eq('id', '034051dc-8742-4df4-85ff-36a01844c612').single();
    console.log(`ID 034051dc-8742-4df4-85ff-36a01844c612 é: ${target?.nome}`);
}

findNetworkOwners();
