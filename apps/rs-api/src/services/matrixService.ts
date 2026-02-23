import { supabase } from '../lib/supabaseClient';

const TARGET_AMOUNT = 60.00; // R$ 60 para ativar matriz
const MATRIX_SIZE = 6; // Matriz 6x6

interface MatrixAccumulator {
  id: string;
  consultor_id: string;
  accumulated_value: number;
  total_activated: number;
}

interface MatrixCycle {
  id: string;
  consultor_id: string;
  cycle_number: number;
  status: 'open' | 'completed';
  slots_filled: number;
  opened_at: string;
  completed_at?: string;
  [key: string]: any; // For dynamic slot fields
}

interface Consultor {
  id: string;
  patrocinador_id?: string;
  status: string;
  patrocinador?: {
    id: string;
    nome: string;
  };
}

interface MatrixPosition {
  uplineId: string;
  linha: number;
  nivel?: number;
}

/**
 * Processa compra e acumula para matriz
 * Quando chega a R$ 60, ativa posição na matriz
 */
export async function processarCompra(consultorId: string, valorCompra: number) {
  console.log(`💰 Processando compra: Consultor ${consultorId} - R$ ${valorCompra}`);

  // 1. Buscar/criar acumulador
  let { data: acumulador } = await supabase
    .from('matrix_accumulator')
    .select('*')
    .eq('consultor_id', consultorId)
    .single();

  if (!acumulador) {
    console.log('📝 Criando acumulador para consultor...');
    const { data: novoAcumulador, error } = await supabase
      .from('matrix_accumulator')
      .insert({
        consultor_id: consultorId,
        accumulated_value: 0.00
      })
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar acumulador: ${error.message}`);
    acumulador = novoAcumulador;
  }

  // 2. Acumular valor
  const currentAccumulated = parseFloat(acumulador.accumulated_value);
  const novoValorAcumulado = currentAccumulated + parseFloat(valorCompra.toString());
  console.log(`📊 Acumulado: R$ ${currentAccumulated} + R$ ${valorCompra} = R$ ${novoValorAcumulado}`);

  // 3. Verificar se atingiu R$ 60
  let positionsActivated = 0;
  let remainingValue = novoValorAcumulado;

  while (remainingValue >= TARGET_AMOUNT) {
    console.log(`🎯 Ativou R$ 60! Adicionando na matriz...`);

    // Adicionar na matriz
    await adicionarNaMatriz(consultorId);

    remainingValue -= TARGET_AMOUNT;
    positionsActivated++;
  }

  // 4. Atualizar acumulador
  await supabase
    .from('matrix_accumulator')
    .update({
      accumulated_value: remainingValue,
      total_activated: acumulador.total_activated + positionsActivated,
      updated_at: new Date().toISOString()
    })
    .eq('id', acumulador.id);

  console.log(`✅ Acumulador atualizado: R$ ${remainingValue} restante, ${positionsActivated} posições ativadas`);

  return {
    positionsActivated,
    remainingValue,
    totalActivated: acumulador.total_activated + positionsActivated
  };
}

/**
 * Adiciona consultor na matriz com spillover esquerda→direita
 */
export async function adicionarNaMatriz(consultorId: string) {
  console.log(`🔍 Buscando posição na matriz para consultor ${consultorId}...`);

  // 1. Buscar consultor e patrocinador
  const { data: consultor } = await supabase
    .from('consultores')
    .select('*, patrocinador:patrocinador_id(id, nome)')
    .eq('id', consultorId)
    .single();

  if (!consultor) throw new Error('Consultor não encontrado');

  const patrocinadorId = consultor.patrocinador_id;

  if (!patrocinadorId) {
    // Se for o root (sem patrocinador), ignorar matriz
    if (consultor.username === 'rsprolipsi') {
      console.log('👑 Root user detected, skipping matrix upline search.');
      return null;
    }
    throw new Error('Consultor sem patrocinador. Todo consultor precisa de indicação.');
  }

  console.log(`👤 Patrocinador: ${patrocinadorId}`);

  // 2. Encontrar próxima posição livre (spillover)
  const posicaoLivre = await encontrarProximaPosicaoLivre(patrocinadorId);

  if (!posicaoLivre) {
    throw new Error('Erro ao encontrar posição livre na matriz');
  }

  console.log(`📍 Posição encontrada: Upline ${posicaoLivre.uplineId}, Linha ${posicaoLivre.linha}`);

  // 3. Buscar ou criar ciclo aberto para o upline
  let { data: cicloAberto } = await supabase
    .from('matriz_cycles')
    .select('*')
    .eq('consultor_id', posicaoLivre.uplineId)
    .eq('status', 'open')
    .order('opened_at', { ascending: false })
    .limit(1)
    .single();

  if (!cicloAberto) {
    console.log(`📝 Criando novo ciclo para upline ${posicaoLivre.uplineId}...`);

    // Buscar número do próximo ciclo
    const { data: ultimoCiclo } = await supabase
      .from('matriz_cycles')
      .select('cycle_number')
      .eq('consultor_id', posicaoLivre.uplineId)
      .order('cycle_number', { ascending: false })
      .limit(1)
      .single();

    const proximoNumero = ultimoCiclo ? ultimoCiclo.cycle_number + 1 : 1;

    const { data: novoCiclo, error } = await supabase
      .from('matriz_cycles')
      .insert({
        consultor_id: posicaoLivre.uplineId,
        cycle_number: proximoNumero,
        status: 'open'
      })
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar ciclo: ${error.message}`);
    cicloAberto = novoCiclo;

    // Registrar evento de abertura
    await supabase
      .from('cycle_events')
      .insert({
        cycle_id: novoCiclo.id,
        consultor_id: posicaoLivre.uplineId,
        event_type: 'cycle_opened',
        event_data: { cycle_number: proximoNumero }
      });
  }

  // 4. Adicionar na downline
  await supabase
    .from('downlines')
    .insert({
      upline_id: posicaoLivre.uplineId,
      downline_id: consultorId,
      linha: posicaoLivre.linha,
      nivel: posicaoLivre.nivel,
      is_active: true
    });

  // 5. Atualizar slot do ciclo
  const slotField = `slot_${posicaoLivre.linha}_sale_id`;
  const { error: updateError } = await supabase
    .from('matriz_cycles')
    .update({
      [slotField]: consultorId,
      slots_filled: cicloAberto.slots_filled + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', cicloAberto.id);

  if (updateError) throw new Error(`Erro ao atualizar ciclo: ${updateError.message}`);

  console.log(`✅ Consultor adicionado na matriz!`);

  // 6. Verificar se completou ciclo (6 slots)
  if (cicloAberto.slots_filled + 1 >= MATRIX_SIZE) {
    console.log(`🎉 Ciclo completado! Efetuando Payout e Reentrada...`);

    const payoutAmount = 108.00; // 30% de 360

    await supabase
      .from('matriz_cycles')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        cycle_payout: payoutAmount
      })
      .eq('id', cicloAberto.id);

    // 6.1 Pagar Bônus na Carteira
    await supabase.from('wallet_transactions').insert({
      user_id: consultor.user_id, // Usar user_id para financeiro
      type: 'bonus_sigme',
      amount: payoutAmount,
      status: 'completed',
      description: `Bônus de Ciclo SIGME #${cicloAberto.cycle_number}`,
      details: { cycle_id: cicloAberto.id }
    });

    // 6.2 Atualizar Saldo da Carteira
    const { data: wallet } = await supabase.from('wallets').select('balance').eq('user_id', consultor.user_id).single();
    if (wallet) {
      await supabase.from('wallets').update({
        balance: Number(wallet.balance) + payoutAmount
      }).eq('user_id', consultor.user_id);
    }

    // 6.3 Verificar Auto-Reinvestimento
    // Buscamos preferência no metadata do consultor
    const { data: config } = await supabase.from('consultores').select('mmn_id').eq('id', posicaoLivre.uplineId).single();

    // Se o consultor for um "Dono de Van" (tem mmn_id) e tiver reinvestimento ativo (simulado aqui por metadata)
    // TODO: Implementar rota de config para salvar essa preferência real

    console.log(`🔔 Evento 'cycle_completed' registrado para ${posicaoLivre.uplineId}`);
  }

  return {
    uplineId: posicaoLivre.uplineId,
    linha: posicaoLivre.linha,
    cicloId: cicloAberto.id
  };
}

/**
 * Encontra próxima posição livre com spillover BALANCEADO (Round Robin)
 * Distribui 1 indicado para cada um dos 6 braços do patrocinador antes de completar o 2º nível de um braço.
 */
export async function encontrarProximaPosicaoLivre(patrocinadorId: string): Promise<MatrixPosition | null> {
  console.log(`⚖️ Buscando posição balanceada a partir de ${patrocinadorId}...`);

  let currentLevelUplines = [patrocinadorId];
  let nivel = 1;

  while (currentLevelUplines.length > 0) {
    // 1. Coletar todos os filhos imediatos de TODOS os uplines deste nível
    const { data: downlines } = await supabase
      .from('downlines')
      .select('upline_id, downline_id, linha')
      .in('upline_id', currentLevelUplines)
      .eq('nivel', 1)
      .order('linha', { ascending: true });

    // 2. Tentar preencher horizontalmente por SLOTS (1..6) através de todos os pais
    // Ex: Tentar preencher slot 1 de todos os pais, depois slot 2 de todos os pais...
    for (let slot = 1; slot <= MATRIX_SIZE; slot++) {
      for (const uplineId of currentLevelUplines) {
        const ocupado = downlines?.find(d => d.upline_id === uplineId && d.linha === slot);
        if (!ocupado) {
          console.log(`  ✅ Posição balanceada encontrada: Upline ${uplineId}, Slot ${slot}, Nível ${nivel}`);
          return {
            uplineId,
            linha: slot,
            nivel: 1 // Nível relativo ao upline imediato
          };
        }
      }
    }

    // 3. Se todos os slots deste nível estão ocupados, descer mais um nível
    // O Round Robin continuará no próximo nível usando a lista horizontal de filhos
    if (downlines && downlines.length > 0) {
      currentLevelUplines = downlines.map(d => d.downline_id);
      nivel++;
    } else {
      break;
    }

    if (nivel > 6) break; // Limite de bônus de profundidade
  }

  return null;
}

/**
 * Busca uplines ativos para distribuição de bônus
 * Implementa compressão dinâmica: pula inativos
 */
export async function buscarUplines(consultorId: string, maxNivel = 6) {
  console.log(`🔍 Buscando uplines ativos até L${maxNivel}...`);

  const uplines = [];
  let currentId = consultorId;
  let nivel = 1;

  while (nivel <= maxNivel) {
    // Buscar patrocinador
    const { data: consultor } = await supabase
      .from('consultores')
      .select('patrocinador_id, status')
      .eq('id', currentId)
      .single();

    if (!consultor || !consultor.patrocinador_id) break;

    currentId = consultor.patrocinador_id;

    // Compressão dinâmica: apenas adiciona se ativo
    if (consultor.status === 'ativo') {
      uplines.push({
        consultor_id: currentId,
        nivel,
        is_active: true
      });
      nivel++;
    } else {
      console.log(`  ⏭️  Upline ${currentId} inativo, aplicando compressão dinâmica...`);
      // Continua subindo sem incrementar nível (compressão)
    }
  }

  console.log(`✅ ${uplines.length} uplines ativos encontrados`);
  return uplines;
}
