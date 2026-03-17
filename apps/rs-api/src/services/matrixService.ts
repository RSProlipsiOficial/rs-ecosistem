import { supabase } from '../lib/supabaseClient';
const { createOrder, registerSale } = require('./salesService');

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

  // ---> CORREÇÃO: ABRE O CICLO PARA QUEM COMPROU, SE ESSE FOR O PRIMEIRO ACESSO OU SE NÃO TEM ABERTO <---
  let { data: myCycle } = await supabase
    .from('matriz_cycles')
    .select('id')
    .eq('consultor_id', consultorId)
    .eq('status', 'open')
    .maybeSingle();

  if (!myCycle) {
    // Busca e incrementa
    const { data: myLastCycle } = await supabase
      .from('matriz_cycles')
      .select('cycle_number')
      .eq('consultor_id', consultorId)
      .order('cycle_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextCycUser = myLastCycle ? myLastCycle.cycle_number + 1 : 1;
    console.log(`🆕 Ativando ciclo nº ${nextCycUser} para o comprador ${consultorId}`);
    
    const { data: openedMyCycle, error: myCycErr } = await supabase
      .from('matriz_cycles')
      .insert({ consultor_id: consultorId, cycle_number: nextCycUser, status: 'open' })
      .select()
      .single();

    if (!myCycErr && openedMyCycle) {
      await supabase.from('cycle_events').insert({
        cycle_id: openedMyCycle.id,
        consultor_id: consultorId,
        event_type: 'cycle_opened',
        event_data: { cycle_number: nextCycUser }
      });
    }
  }

  // --- ATIVAÇÃO DE STATUS DO CONSULTOR ---
  if (consultor.status !== 'ativo') {
    console.log(`🚀 Ativando consultor ${consultorId} na tabela de consultores...`);
    await supabase
      .from('consultores')
      .update({
        status: 'ativo',
        data_ativacao: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', consultorId);
  } else {
    console.log(`ℹ️  Consultor ${consultorId} já possui status ativo.`);
  }

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

    // --- TRIGGER ATIVAÇÃO AUTOMÁTICA ---
    void triggerAutoActivation(posicaoLivre.uplineId).catch(err => {
      console.error(`❌ Erro no trigger de auto-ativação para ${posicaoLivre.uplineId}:`, err.message);
    });
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

/**
 * Trigger para ativação automática (Reinvestimento)
 * Verifica config, debita wallet e cria novo pedido/matriz
 */
async function triggerAutoActivation(consultorId: string) {
  console.log(`🔄 [AutoActivation] Iniciando trigger para ${consultorId}...`);

  // 1. Buscar Consultor e Config
  const { data: consultor } = await supabase
    .from('consultores')
    .select('*, user_id')
    .eq('id', consultorId)
    .single();

  if (!consultor || !consultor.mes_referencia || !consultor.mes_referencia.startsWith('SIGME_AUTO|')) {
    console.log(`  ℹ️  Consultor ${consultorId} não possui auto-reinvestimento ativo.`);
    return;
  }

  const [, productId, cdId, shippingMethod = 'pickup'] = consultor.mes_referencia.split('|');

  // 2. Buscar Produto para saber o preço
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (!product) {
    console.error(`  ❌ Produto ${productId} não encontrado para auto-reinvestimento.`);
    return;
  }

  // Preço consultor (50%)
  const priceFinal = product.price_consultor || (product.price_base || product.price || 0) * 0.5;
  const shippingCost = 0; // Por simplificação na auto-ativação assume-est CD ou pickup
  const totalNeeded = priceFinal + shippingCost;

  // 3. Verificar Saldo na Wallet
  const { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('consultor_id', consultorId)
    .single();

  if (!wallet || parseFloat(wallet.saldo_disponivel) < totalNeeded) {
    console.warn(`  ⚠️  Saldo insuficiente para auto-reinvestimento (${consultorId}): R$ ${wallet?.saldo_disponivel} < R$ ${totalNeeded}`);
    
    // Registrar falha por saldo
    await supabase.from('audit_logs').insert({
      user_id: consultor.user_id,
      action: 'sigme_auto_activation_failed',
      details: { reason: 'insufficient_funds', required: totalNeeded, balance: wallet?.saldo_disponivel }
    });
    return;
  }

  console.log(`  💰 Saldo OK (R$ ${wallet.saldo_disponivel}). Processando pedido...`);

  // 4. Criar Pedido (SalesService)
  const order = await createOrder({
    buyerId: consultorId,
    buyerEmail: consultor.email,
    buyerName: consultor.nome,
    buyerPhone: (consultor as any).whatsapp,
    buyerType: 'consultor',
    referredBy: consultor.patrocinador_id, // Mantém o patrocinador original
    items: [{ product_id: productId, quantity: 1 }],
    shippingMethod,
    shippingCost,
    customerNotes: 'Ativação Automática SIGME (Reinvestimento)'
  });

  // 5. Debitar Wallet e Confirmar Venda
  const newBalance = parseFloat(wallet.saldo_disponivel) - totalNeeded;
  
  await supabase.from('wallets').update({
    saldo_disponivel: newBalance,
    saldo_total: parseFloat(wallet.saldo_total) - totalNeeded,
    updated_at: new Date().toISOString()
  }).eq('id', wallet.id);

  // Registrar Transação de Débito
  await supabase.from('wallet_transactions').insert({
    user_id: consultor.user_id,
    type: 'debit',
    amount: totalNeeded,
    description: `Auto-Ativação SIGME - Pedido #${order.id}`,
    order_id: order.id,
    balance_after: newBalance
  });

  // 6. Registrar a Venda (Isso já chama processarCompra -> adicionarNaMatriz recursivamente)
  await registerSale({
    orderId: order.id,
    mpPaymentId: `AUTO-${Date.now()}`,
    amount: totalNeeded,
    method: 'wallet',
    receivedAt: new Date().toISOString()
  });

  console.log(`  ✅ [AutoActivation] Sucesso para ${consultorId}! Novo pedido: ${order.id}`);
}
