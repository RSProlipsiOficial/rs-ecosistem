
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const JM_ID = '034051dc-8742-4df4-85ff-36a01844c612';
const MATRIX_SIZE = 6;

async function fixMatrix() {
    console.log('--- INICIANDO CORREÇÃO DE MATRIZ JM ---');

    // 1. Obter todos os diretos por ordem de criação
    const { data: directs, error: e1 } = await supabase
        .from('consultores')
        .select('id, nome, created_at')
        .eq('patrocinador_id', JM_ID)
        .order('created_at', { ascending: true });

    if (e1) throw e1;
    console.log(`Encontrados ${directs.length} diretos.`);

    // 2. Limpar posições atuais dos diretos na matriz (apenas onde eles são o downline)
    const directIds = directs.map(d => d.id);
    console.log('Limpando registros antigos em downlines...');
    const { error: e2 } = await supabase
        .from('downlines')
        .delete()
        .in('downline_id', directIds);

    if (e2) throw e2;

    // 3. Re-inserir usando lógica Round Robin
    console.log('Re-alocando consultores...');

    // Lista de uplines por nível
    let uplinesByLevel = [[JM_ID]];

    for (let i = 0; i < directs.length; i++) {
        const consultor = directs[i];
        let placed = false;
        let currentLevel = 0;

        while (!placed) {
            const currentLevelUplines = uplinesByLevel[currentLevel];

            // Tentar preencher horizontalmente por SLOTS de todos os pais deste nível
            for (let slot = 1; slot <= MATRIX_SIZE; slot++) {
                for (const uplineId of currentLevelUplines) {
                    // Verificar se este pai já tem esse slot ocupado NESTE NOVO PROCESSAMENTO
                    // Como estamos processando um por um e limpamos tudo, precisamos conferir o que já inserimos
                    const { data: ocu } = await supabase
                        .from('downlines')
                        .select('id')
                        .eq('upline_id', uplineId)
                        .eq('linha', slot)
                        .eq('nivel', 1)
                        .single();

                    if (!ocu) {
                        // Slot livre! Inserir.
                        const { error: insErr } = await supabase
                            .from('downlines')
                            .insert({
                                upline_id: uplineId,
                                downline_id: consultor.id,
                                linha: slot,
                                nivel: 1,
                                is_active: true
                            });

                        if (insErr) throw insErr;

                        console.log(`[${i + 1}] ${consultor.nome.padEnd(30)} -> Upline: ${uplineId} | Slot: ${slot} (Nível ${currentLevel + 1})`);
                        placed = true;
                        break;
                    }
                }
                if (placed) break;
            }

            if (!placed) {
                // Se nível atual está cheio, preparar próximo nível se necessário
                if (!uplinesByLevel[currentLevel + 1]) {
                    // Coletar todos os filhos do nível atual para serem uplines do próximo
                    const { data: children } = await supabase
                        .from('downlines')
                        .select('downline_id')
                        .in('upline_id', currentLevelUplines)
                        .eq('nivel', 1);

                    uplinesByLevel[currentLevel + 1] = (children || []).map(c => c.downline_id);
                }
                currentLevel++;

                if (currentLevel > 10) {
                    console.error('ERRO: Não encontrou vaga após 10 níveis. Algo está muito errado.');
                    break;
                }
            }
        }
    }

    console.log('--- CORREÇÃO CONCLUÍDA ---');
}

fixMatrix().catch(console.error);
