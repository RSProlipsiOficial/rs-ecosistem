const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/rs-api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function run() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const targetId = '89c000c0-7a39-4e1e-8dee-5978d846fa89'; // RS Prólipsi

    console.log(`--- AUDITORIA PROFUNDA: RS Prólipsi ---`);

    // 1. Checar se alguém tem ela como patrocinador
    const { count: countSpon } = await supabase
        .from('consultores')
        .select('*', { count: 'exact', head: true })
        .eq('patrocinador_id', targetId);

    // 2. Checar na tabela downlines (nivel 1)
    const { count: countDown } = await supabase
        .from('downlines')
        .select('*', { count: 'exact', head: true })
        .eq('upline_id', targetId)
        .eq('nivel', 1);

    console.log(`Indicados via patrocinador_id: ${countSpon}`);
    console.log(`Indicados via downlines (nivel 1): ${countDown}`);

    // 3. Se ambos forem zero, vamos ver se ela é downline de alguém?
    const { data: upline } = await supabase
        .from('consultores')
        .select('patrocinador_id')
        .eq('id', targetId)
        .single();

    console.log(`Patrocinador dela: ${upline?.patrocinador_id}`);

    // 4. Listar TODOS que não tem patrocinador para ver se o usuário está olhando a conta certa
    const { data: allRoots } = await supabase
        .from('consultores')
        .select('id, nome')
        .is('patrocinador_id', null);

    console.log('Todos os "Mestres" (sem patrocinador):');
    console.table(allRoots);
}
run();
