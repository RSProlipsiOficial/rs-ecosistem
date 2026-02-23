
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function deepAudit() {
    console.log('=== AUDITORIA PROFUNDA: JOÃO MIRANDA (JM) ===');

    const JM_ID = '034051dc-8742-4df4-85ff-36a01844c612';
    console.log(`Líder: João José Oliveira Miranda (${JM_ID})`);

    // 2. Buscar todos os diretos no Unilevel (quem ele cadastrou)
    const { data: directs } = await supabase
        .from('consultores')
        .select('id, nome, created_at, status')
        .eq('patrocinador_id', JM_ID)
        .order('created_at', { ascending: true });

    console.log(`\nJoão Miranda tem ${directs.length} diretos cadastrados (Unilevel).`);

    // 3. Ver onde esses diretos estão na Matriz 6x6 (downlines)
    const directIds = (directs || []).map(d => d.id);
    if (directIds.length === 0) {
        console.log('Nenhum direto encontrado.');
        return;
    }

    const { data: matrixPlacements } = await supabase
        .from('downlines')
        .select('downline_id, upline_id, linha, nivel, consultores!upline_id(nome)')
        .in('downline_id', directIds)
        .eq('nivel', 1);

    console.log('\nAlocação dos diretos de JM na Matriz 6x6:');

    const placementMap = {};
    (matrixPlacements || []).forEach(p => {
        placementMap[p.downline_id] = p;
    });

    directs.forEach((d, index) => {
        const placement = placementMap[d.id];
        if (placement) {
            console.log(`${index + 1}. ${d.nome.padEnd(30)} -> Pai Matriz: ${placement.consultores?.nome || placement.upline_id} (Slot ${placement.linha})`);
        } else {
            console.log(`${index + 1}. ${d.nome.padEnd(30)} -> [!] NÃO ENCONTRADO NA MATRIZ`);
        }
    });

    // 4. Analisar Alciones (AR) especificamente
    const AR_NAME = 'ALCIONES LUIS'; // Ajustar se necessário
    const { data: alciones } = await supabase
        .from('consultores')
        .select('id, nome')
        .ilike('nome', `%${AR_NAME}%`)
        .single();

    if (alciones) {
        console.log(`\nAnalisando Alciones (AR): ${alciones.nome} (${alciones.id})`);
        const { data: arMatrix } = await supabase
            .from('downlines')
            .select('downline_id, linha, consultores!downline_id(nome)')
            .eq('upline_id', alciones.id)
            .eq('nivel', 1)
            .order('linha');

        console.log(`Alciones tem ${arMatrix?.length || 0} pessoas no seu 1º nível da matriz:`);
        (arMatrix || []).forEach(m => {
            console.log(` - Slot ${m.linha}: ${m.consultores?.nome}`);
        });
    } else {
        console.log('\nAlciones não encontrado pelo nome.');
    }
}

deepAudit().catch(console.error);
