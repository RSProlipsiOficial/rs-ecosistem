const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/rs-api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const MATRIX_SIZE = 6;

async function encontrarProximaPosicaoLivre(patrocinadorId, matrixSize = 6) {
    let currentLevelUplines = [patrocinadorId];
    let nivel = 1;

    while (currentLevelUplines.length > 0) {
        const { data: downlines } = await supabase
            .from('downlines')
            .select('upline_id, downline_id, linha')
            .in('upline_id', currentLevelUplines)
            .eq('nivel', 1)
            .order('linha', { ascending: true });

        for (let slot = 1; slot <= matrixSize; slot++) {
            for (const uplineId of currentLevelUplines) {
                const ocupado = downlines?.find(d => d.upline_id === uplineId && d.linha === slot);
                if (!ocupado) {
                    return { uplineId, linha: slot };
                }
            }
        }

        if (downlines && downlines.length > 0) {
            currentLevelUplines = downlines.map(d => d.downline_id);
            nivel++;
        } else break;
        if (nivel > 6) break;
    }
    return null;
}

async function rebuildMatrix() {
    const ROOT_ID = '89c000c0-7a39-4e1e-8dee-5978d846fa89';

    console.log('--- RECONSTRUINDO MATRIZ SIGME 1+6 ---');

    // 1. Limpar tabelas relacionadas (CUIDADO: Isso altera o estado global)
    console.log('Limpando tabelas da matriz...');

    await supabase.from('cycle_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('matriz_cycles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('downlines').delete().neq('downline_id', '00000000-0000-0000-0000-000000000000');

    // Opcional: Zerar acumuladores para começar do zero
    await supabase.from('matrix_accumulator').update({ accumulated_value: 0, total_activated: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Buscar todos os consultores (exceto Root) ordenados por data de criação
    // Adicionamos ID na ordenação para ser 100% determinístico em caso de timestamps iguais
    const { data: consultores, error: fetchError } = await supabase
        .from('consultores')
        .select('id, nome, patrocinador_id, created_at')
        .neq('id', ROOT_ID)
        .order('created_at', { ascending: true })
        .order('id', { ascending: true });

    if (fetchError) {
        console.error('Erro ao buscar consultores:', fetchError);
        return;
    }

    console.log(`Processando ${consultores?.length} consultores...`);

    for (const c of (consultores || [])) {
        let patrocinadorId = c.patrocinador_id || ROOT_ID;

        // VERIFICAÇÃO EXTRA: O patrocinador já deve estar na matriz (downlines)
        // Se não estiver, ele cai para o Root temporariamente ou gera aviso
        if (patrocinadorId !== ROOT_ID) {
            const { data: hasSponsor } = await supabase.from('downlines').select('id').eq('downline_id', patrocinadorId).limit(1).single();
            if (!hasSponsor) {
                console.warn(`⚠️  Patrocinador ${patrocinadorId} de ${c.nome} ainda não está na matriz. Vinculando ao ROOT para evitar furos.`);
                patrocinadorId = ROOT_ID;
            }
        }

        // Encontrar posição seguindo Round Robin
        const pos = await encontrarProximaPosicaoLivre(patrocinadorId);

        if (pos) {
            console.log(`Inserindo ${c.nome} sob ${pos.uplineId} (Slot ${pos.linha})`);

            // 3.1 Inserir na downline
            await supabase.from('downlines').insert({
                upline_id: pos.uplineId,
                downline_id: c.id,
                nivel: 1,
                linha: pos.linha,
                is_active: true
            });

            // 3.2 Gerenciar Ciclo do Upline
            let { data: ciclo } = await supabase.from('matriz_cycles').select('*').eq('consultor_id', pos.uplineId).eq('status', 'open').single();
            if (!ciclo) {
                const { data: novoCiclo } = await supabase.from('matriz_cycles').insert({
                    consultor_id: pos.uplineId,
                    cycle_number: 1,
                    status: 'open',
                    slots_filled: 0
                }).select().single();
                ciclo = novoCiclo;
            }

            const slotField = `slot_${pos.linha}_sale_id`;
            const novoSlotsFilled = (ciclo.slots_filled || 0) + 1;
            const isCompleted = novoSlotsFilled >= MATRIX_SIZE;

            await supabase.from('matriz_cycles').update({
                [slotField]: c.id,
                slots_filled: novoSlotsFilled,
                status: isCompleted ? 'completed' : 'open',
                completed_at: isCompleted ? new Date().toISOString() : null
            }).eq('id', ciclo.id);

        } else {
            console.warn(`ERRO: Não encontrou posição para ${c.nome}`);
        }
    }

    console.log('--- RECONSTRUÇÃO CONCLUÍDA ---');
}

rebuildMatrix();
