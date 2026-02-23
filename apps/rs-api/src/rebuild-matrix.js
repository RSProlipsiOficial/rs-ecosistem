/**
 * RECONSTRUÇÃO DA MATRIZ 6x6 - ORDEM DE CADASTRO + SPILLOVER FORÇADO
 * Processa todos os consultores respeitando hierarquia e ordem
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Reimplementação da lógica de matriz em JavaScript puro
const MATRIX_SIZE = 6;

async function encontrarPosicaoLivre(patrocinadorId) {
    // BFS para encontrar primeira posição livre
    const fila = [{ uplineId: patrocinadorId, nivel: 1 }];
    const visitados = new Set();

    while (fila.length > 0) {
        const { uplineId, nivel } = fila.shift();
        if (visitados.has(uplineId)) continue;
        visitados.add(uplineId);

        // Buscar downlines existentes
        const { data: downlines } = await supabase
            .from('downlines')
            .select('linha')
            .eq('upline_id', uplineId)
            .eq('nivel', 1); // Apenas diretos

        const linhasOcupadas = (downlines || []).map(d => d.linha);

        // Procurar linha livre (1-6)
        for (let linha = 1; linha <= MATRIX_SIZE; linha++) {
            if (!linhasOcupadas.includes(linha)) {
                return { uplineId, linha, nivel: 1 };
            }
        }

        // Se cheio, adicionar filhos na fila
        if (downlines && downlines.length > 0) {
            const { data: filhos } = await supabase
                .from('downlines')
                .select('downline_id')
                .eq('upline_id', uplineId)
                .eq('nivel', 1);

            (filhos || []).forEach(f => {
                fila.push({ uplineId: f.downline_id, nivel: nivel + 1 });
            });
        }
    }

    return null;
}

async function adicionarNaMatrizSimples(consultorId, patrocinadorId) {
    // Encontrar posição
    const posicao = await encontrarPosicaoLivre(patrocinadorId);
    if (!posicao) {
        throw new Error('Não foi possível encontrar posição livre');
    }

    // Buscar ou criar ciclo
    let { data: cicloAberto } = await supabase
        .from('matriz_cycles')
        .select('*')
        .eq('consultor_id', posicao.uplineId)
        .eq('status', 'open')
        .order('opened_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (!cicloAberto) {
        // Criar novo ciclo
        const { data: ultimoCiclo } = await supabase
            .from('matriz_cycles')
            .select('cycle_number')
            .eq('consultor_id', posicao.uplineId)
            .order('cycle_number', { ascending: false })
            .limit(1)
            .maybeSingle();

        const proximoNumero = (ultimoCiclo?.cycle_number || 0) + 1;

        const { data: novoCiclo } = await supabase
            .from('matriz_cycles')
            .insert({
                consultor_id: posicao.uplineId,
                cycle_number: proximoNumero,
                status: 'open',
                slots_filled: 0
            })
            .select()
            .single();

        cicloAberto = novoCiclo;
    }

    // Adicionar downline
    await supabase.from('downlines').insert({
        upline_id: posicao.uplineId,
        downline_id: consultorId,
        linha: posicao.linha,
        nivel: posicao.nivel,
        is_active: true
    });

    // Atualizar slot do ciclo
    const slotField = `slot_${posicao.linha}_sale_id`;
    const novoTotal = (cicloAberto.slots_filled || 0) + 1;

    await supabase
        .from('matriz_cycles')
        .update({
            [slotField]: consultorId,
            slots_filled: novoTotal,
            updated_at: new Date().toISOString()
        })
        .eq('id', cicloAberto.id);

    // Verificar se completou
    if (novoTotal >= MATRIX_SIZE) {
        await supabase
            .from('matriz_cycles')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString()
            })
            .eq('id', cicloAberto.id);

        await supabase.from('cycle_events').insert({
            cycle_id: cicloAberto.id,
            consultor_id: posicao.uplineId,
            event_type: 'cycle_completed',
            event_data: { cycle_number: cicloAberto.cycle_number, payout: 108.00 }
        });
    }

    return posicao;
}

async function main() {
    console.log('\n🔄 RECONSTRUÇÃO DA MATRIZ 6x6 FORÇADA\n');

    // Limpar dados antigos
    console.log('🧹 Limpando matriz antiga...');
    await supabase.from('downlines').delete().neq('upline_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('matriz_cycles').delete().neq('status', 'non-existent');
    await supabase.from('matrix_accumulator').delete().neq('accumulated_value', -999);
    await supabase.from('cycle_events').delete().neq('event_type', 'none');
    console.log('✅ Limpeza concluída\n');

    // Buscar consultores em  ordem
    console.log('📋 Carregando consultores...');
    const { data: consultores } = await supabase
        .from('consultores')
        .select('id, nome, patrocinador_id, created_at')
        .order('created_at', { ascending: true });

    console.log(`✅ ${consultores.length} consultores\n`);

    // Processar cada um
    console.log('⚙️  Processando matriz...\n');
    let processados = 0;
    let erros = 0;

    for (const c of consultores) {
        if (!c.patrocinador_id) {
            console.log(`  👑 Root: ${c.nome}`);
            continue;
        }

        try {
            await adicionarNaMatrizSimples(c.id, c.patrocinador_id);
            processados++;

            if (processados % 20 === 0) {
                console.log(`  ✓ ${processados}/${consultores.length} processados...`);
            }
        } catch (err) {
            console.error(`  ❌ ${c.nome}: ${err.message}`);
            erros++;
        }
    }

    console.log('\n═══════════════════════════════════════════');
    console.log('✅ RECONSTRUÇÃO CONCLUÍDA!');
    console.log(`   Processados: ${processados}`);
    console.log(`   Erros: ${erros}`);
    console.log('═══════════════════════════════════════════\n');
}

main().catch(err => {
    console.error('\n❌ ERRO:', err.message);
    process.exit(1);
});
