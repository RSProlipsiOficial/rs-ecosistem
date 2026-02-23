const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/rs-api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function run() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const OFFICIAL_EMAIL = 'rsprolipsioficial@gmail.com';

    console.log(`--- VERIFICAÇÃO DE UNIFICAÇÃO (EMAIL: ${OFFICIAL_EMAIL}) ---`);

    // 1. Buscar todos os IDs oficiais
    const { data: officials } = await supabase.from('consultores').select('id, nome, email').eq('email', OFFICIAL_EMAIL);
    const officialIds = officials.map(o => o.id);

    console.log(`IDs oficiais encontrados (${officialIds.length}):`);
    officials.forEach(o => console.log(`- ${o.nome} (ID: ${o.id})`));

    // 2. Simular contagem de indicados diretos (lógica do /sigma/stats)
    const { count: directCount } = await supabase
        .from('consultores')
        .select('id', { count: 'exact' })
        .in('patrocinador_id', officialIds);

    console.log(`\nContagem TOTAL de indicados diretos unificados: ${directCount}`);

    // 3. Simular primeiro nível da Matriz
    const { data: matrixLevel1 } = await supabase
        .from('downlines')
        .select('downline_id, linha, upline_id')
        .in('upline_id', officialIds)
        .eq('nivel', 1);

    console.log(`\nFilhos no Nível 1 da Matriz unificada: ${matrixLevel1.length}`);
    matrixLevel1.sort((a, b) => a.linha - b.linha).forEach(m => {
        console.log(`- Linha ${m.linha}: Upline ${m.upline_id} -> Downline ${m.downline_id}`);
    });

    if (directCount >= 18) {
        console.log('\n✅ SUCESSO: A contagem de indicados diretos agora é igual ou superior a 18.');
    } else {
        console.log('\n❌ FALHA: A contagem ainda está abaixo do esperado pelo Admin.');
    }

    if (matrixLevel1.length >= 6) {
        console.log('✅ SUCESSO: A matriz agora mostra os 6 slots preenchidos.');
    } else {
        console.log('❌ FALHA: A matriz ainda tem menos de 6 filhos no nível 1.');
    }
}

run();
