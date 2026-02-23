const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/rs-api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function run() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // IDs das Entidades
    const RS_PROLIPSI_ID = '89c000c0-7a39-4e1e-8dee-5978d846fa89'; // Tem 18 diretos
    const ROTA_FACIL_ID = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';  // Tem o Email Oficial (Super Root)

    console.log(`--- INICIANDO MIGRAÇÃO DE REDE ---`);
    console.log(`De: RS Prólipsi (${RS_PROLIPSI_ID})`);
    console.log(`Para: Rota Fácil Oficial (${ROTA_FACIL_ID})`);

    // 1. Migrar Indicados Diretos (Unilevel) na tabela 'consultores'
    const { data: updatedConsultants, error: errC } = await supabase
        .from('consultores')
        .update({ patrocinador_id: ROTA_FACIL_ID })
        .eq('patrocinador_id', RS_PROLIPSI_ID)
        .select('id, nome');

    if (errC) {
        console.error('❌ Erro ao migrar consultores:', errC.message);
    } else {
        console.log(`✅ ${updatedConsultants.length} indicados diretos migrados no Unilevel.`);
        updatedConsultants.forEach(c => console.log(`   - ${c.nome}`));
    }

    // 2. Migrar Downlines na Matriz (Nível 1) na tabela 'downlines'
    // IMPORTANTE: A Matrix 6x6 da Rota Fácil já tem 4 ocupados. A RS Prólipsi tem 6.
    // Para evitar conflito de 'linha' (posição 1-6), vamos apenas atualizar o upline_id 
    // daqueles que não causarem colisão na matriz da Rota Fácil.

    const { data: rsDownlines } = await supabase.from('downlines').select('*').eq('upline_id', RS_PROLIPSI_ID).eq('nivel', 1);
    const { data: rfDownlines } = await supabase.from('downlines').select('*').eq('upline_id', ROTA_FACIL_ID).eq('nivel', 1);

    const occupiedLines = rfDownlines.map(d => d.linha);
    console.log(`\nLinhas ocupadas na Matriz da Rota Fácil: ${occupiedLines.join(', ')}`);

    let migratedMatrixCount = 0;
    for (const d of rsDownlines) {
        if (!occupiedLines.includes(d.linha)) {
            const { error: errM } = await supabase
                .from('downlines')
                .update({ upline_id: ROTA_FACIL_ID })
                .eq('upline_id', RS_PROLIPSI_ID)
                .eq('downline_id', d.downline_id)
                .eq('nivel', 1);

            if (!errM) migratedMatrixCount++;
        }
    }
    console.log(`✅ ${migratedMatrixCount} slots de Matriz migrados para Rota Fácil (sem colisão).`);

    console.log(`\n--- MIGRAÇÃO CONCLUÍDA ---`);
}

run();
