
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/rs-api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function run() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('--- AUDITANDO REDE ---');

    // Buscar todos os consultores
    const { data: all } = await supabase.from('consultores').select('id, nome, email');

    // Contar diretos para cada um na tabela downlines
    const { data: levels } = await supabase.from('downlines').select('upline_id').eq('nivel', 1);

    const countMap = {};
    levels.forEach(l => {
        countMap[l.upline_id] = (countMap[l.upline_id] || 0) + 1;
    });

    const results = all.map(c => ({
        id: c.id,
        nome: c.nome,
        diretos: countMap[c.id] || 0
    })).sort((a, b) => b.diretos - a.diretos).slice(0, 10);

    console.log('Top 10 Consultores com mais diretos (via Downlines):');
    console.table(results);

    // Agora via patrocinador_id
    const { data: sponsors } = await supabase.from('consultores').select('patrocinador_id');
    const sponMap = {};
    sponsors.forEach(s => {
        if (s.patrocinador_id) sponMap[s.patrocinador_id] = (sponMap[s.patrocinador_id] || 0) + 1;
    });

    const resSpon = all.map(c => ({
        id: c.id,
        nome: c.nome,
        diretos: sponMap[c.id] || 0
    })).sort((a, b) => b.diretos - a.diretos).slice(0, 10);

    console.log('Top 10 Consultores com mais diretos (via patrocinador_id):');
    console.table(resSpon);
}
run();
