const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const filePath = 'd:\\Rs  Ecosystem\\rs-ecosystem\\Documentação RS Prólipsi (Ver Sempre)\\Rede da RS Prólipsi Completo.xlsx';

async function forceExcelMatrix() {
    try {
        console.log('--- FORÇANDO HIERARQUIA EXCEL NA MATRIZ SIGME ---');

        // 1. Ler Planilha
        const workbook = xlsx.readFile(filePath);
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        // 2. Mapear Nome -> ID do Banco
        const { data: dbConsultants } = await supabase.from('consultores').select('id, nome');
        const nameToId = new Map(dbConsultants.map(c => [c.nome.toLowerCase().trim(), c.id]));

        console.log(`Planilha: ${data.length} registros | Banco: ${dbConsultants.length} registros`);

        // 3. Limpar Downlines (Opcional ou planejado - vamos apenas atualizar para segurança)
        // console.log('Limpando tabela downlines para reestruturação...');
        // await supabase.from('downlines').delete().neq('id', '0000-0000-0000-0000'); // Manter segurança

        const ROOT_ID = '89c000c0-7a39-4e1e-8dee-5978d846fa89';

        // 4. Percorrer Planilha e criar vínculos
        let processed = 0;
        for (const row of data) {
            const name = row.Nome?.toLowerCase().trim();
            const sponsorName = row.Indicador?.toLowerCase().trim();

            const childId = nameToId.get(name);
            let parentId = nameToId.get(sponsorName);

            // Fallback root
            if (sponsorName === 'raiz top da rede') parentId = ROOT_ID;

            if (childId && parentId) {
                // Atualizar patrocinador_id na tabela consultores para bater com Excel
                await supabase.from('consultores').update({ patrocinador_id: parentId }).eq('id', childId);

                // Garantir registro na tabela downlines (Nível 1)
                const { data: existing } = await supabase.from('downlines')
                    .select('*')
                    .eq('upline_id', parentId)
                    .eq('downline_id', childId)
                    .maybeSingle();

                if (!existing) {
                    await supabase.from('downlines').insert({
                        upline_id: parentId,
                        downline_id: childId,
                        nivel: 1,
                        is_active: true
                    });
                }
                processed++;
            }
        }

        console.log(`Sucesso: ${processed} vínculos sincronizados conforme o Excel.`);
        console.log('A Matriz SIGME (1+6) agora exibirá os indicados na ordem hierárquica oficial.');

    } catch (error) {
        console.error('Erro Fatal:', error);
    }
}

forceExcelMatrix();
