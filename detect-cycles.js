const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function detectCycles() {
    console.log('--- DETECTOR DE CIRCULARIDADE ---');

    const { data: all } = await supabase.from('consultores').select('id, nome, patrocinador_id');
    const userMap = {};
    all.forEach(u => userMap[u.id] = u);

    for (const user of all) {
        let current = user;
        const path = new Set();
        const sequence = [];

        while (current && current.patrocinador_id) {
            if (path.has(current.id)) {
                console.log(`❌ CICLO DETECTADO: ${user.nome} -> ... -> ${current.nome}`);
                console.log(`Sequência do erro: ${sequence.join(' -> ')} -> ${current.id}`);
                break;
            }
            path.add(current.id);
            sequence.push(`${current.nome} (${current.id})`);
            current = userMap[current.patrocinador_id];
            if (!current) break;
        }
    }

    console.log('\n--- BUSCA FINAL POR JOÃO MIRANDA ---');
    const { data: results } = await supabase.from('consultores').select('id, nome, email').ilike('nome', '%Miranda%');
    console.log('Resultados Miranda:', results);
}

detectCycles();
