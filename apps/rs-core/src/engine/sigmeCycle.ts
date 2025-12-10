/**
 * RS PRÓLIPSI - MOTOR DO CICLO SIGMA
 * Engine principal que processa vendas, ciclos e pontuação
 */

import { distributeAllBonuses, calculateValidCycles } from '../math/distributeBonus';
import { getSigmaConfigCore } from '../services/sigmaConfigCore';
import { createClient } from '@supabase/supabase-js';

// ================================================
// TIPOS
// ================================================

interface SaleData {
  sale_id: string;
  buyer_id: string;
  product_id: string;
  price_final: number;
  quantity: number;
}

interface CycleStatus {
  cycle_id: string;
  consultor_id: string;
  slots_filled: number;
  slots_total: number;
  status: 'open' | 'completed';
  completed: boolean;
}

interface CycleResult {
  success: boolean;
  sale_registered: boolean;
  cycle_updated: boolean;
  cycle_completed: boolean;
  cycle_id: string;
  slots_filled: number;
  bonuses_distributed?: any[];
  career_point_awarded?: boolean;
  new_cycle_id?: string;
  payout?: number;
  errors?: string[];
}

// ================================================
// 1. PROCESSAR VENDA
// ================================================

export async function processSale(sale: SaleData): Promise<CycleResult> {
  const result: CycleResult = {
    success: false,
    sale_registered: false,
    cycle_updated: false,
    cycle_completed: false,
    cycle_id: '',
    slots_filled: 0,
    errors: []
  };

  try {
    // 1. Registrar venda na tabela sales
    const saleRecord = await registerSale(sale);
    result.sale_registered = true;

    // 2. Buscar ou criar ciclo aberto
    let cycle = await findOpenCycle(sale.buyer_id);
    
    if (!cycle) {
      cycle = await createNewCycle(sale.buyer_id);
    }

    result.cycle_id = cycle.cycle_id;

    // 3. Preencher próximo slot disponível
    const nextSlot = cycle.slots_filled + 1;
    await fillCycleSlot(cycle.cycle_id, nextSlot, saleRecord.sale_id);
    
    result.cycle_updated = true;
    result.slots_filled = nextSlot;

    // 4. Verificar se ciclo completou (6/6)
    if (nextSlot === 6) {
      result.cycle_completed = true;
      
      // 4a. Marcar ciclo como completo
      await completeCycle(cycle.cycle_id);
      
      // 4b. Distribuir bônus
      const cfg = await getSigmaConfigCore();
      const bonuses = await distributeAllBonuses({
        consultor_id: sale.buyer_id,
        cycle_id: cycle.cycle_id,
        cycle_value: cfg.cycle.value
      });
      result.bonuses_distributed = bonuses;
      result.payout = cfg.cycle.payoutValue;
      
      // 4c. Atribuir ponto de carreira
      await awardCareerPoint(sale.buyer_id, cycle.cycle_id);
      result.career_point_awarded = true;
      
      // 4d. Criar novo ciclo (reentrada automática)
      const newCycle = await createNewCycle(sale.buyer_id);
      result.new_cycle_id = newCycle.cycle_id;
      
      // 4e. Registrar evento de ciclo completado
      await logCycleEvent({
        cycle_id: cycle.cycle_id,
        consultor_id: sale.buyer_id,
        event_type: 'cycle_completed',
        event_data: {
          payout: cfg.cycle.payoutValue,
          point_awarded: true,
          new_cycle_id: newCycle.cycle_id
        }
      });
    }

    result.success = true;
    return result;

  } catch (error: any) {
    result.errors?.push(error.message);
    console.error('❌ Erro ao processar venda:', error);
    return result;
  }
}

// ================================================
// 2. VERIFICAR CICLOS AUTOMÁTICO (CRON)
// ================================================

export async function checkPendingCycles(): Promise<void> {
  try {
    // Buscar todos os ciclos abertos
    const openCycles = await getAllOpenCycles();

    for (const cycle of openCycles) {
      // Verificar se está próximo de completar
      if (cycle.slots_filled >= 5) {
        await notifyNearCompletion(cycle.consultor_id, cycle.slots_filled);
      }

      // Verificar se ciclo está travado (sem movimentação há X dias)
      const daysSinceLastSale = await getDaysSinceLastSale(cycle.cycle_id);
      if (daysSinceLastSale > 30) {
        await notifyStagnantCycle(cycle.consultor_id, daysSinceLastSale);
      }
    }

  } catch (error) {
    console.error('❌ Erro ao verificar ciclos:', error);
  }
}

// ================================================
// 3. CALCULAR PONTOS COM VMEC
// ================================================

export async function calculateCareerPoints(consultorId: string): Promise<{
  ciclos_totais: number;
  ciclos_validos_vmec: number;
  pin_atual: string;
  proximo_pin: string;
  progresso: number;
}> {
  try {
    // Buscar dados do consultor
    const consultor = await getConsultorData(consultorId);
    
    // Buscar ciclos de cada linha direta
    const linhasCiclos = await getCyclesByDirectLines(consultorId);
    
    // Aplicar VMEC conforme PIN atual
    const cfg = await getSigmaConfigCore();
    const pinCfg = cfg.career.pins.find(p => p.orderIndex === consultor.pin_nivel);
    const vmec = pinCfg ? {
      linhas_requeridas: pinCfg.minLinesRequired,
      percentuais: String(pinCfg.vmecDistribution).split(/[\/|,]/).map(s => parseFloat(String(s).trim())).filter(n => !isNaN(n))
    } : { linhas_requeridas: 0, percentuais: [] };
    const ciclosValidos = calculateValidCycles(linhasCiclos, vmec);
    
    // Buscar próxima graduação
    const proximaGraduacao = await getNextGraduation(consultor.pin_nivel, ciclosValidos);
    
    return {
      ciclos_totais: linhasCiclos.reduce((sum, l) => sum + l.ciclos, 0),
      ciclos_validos_vmec: ciclosValidos,
      pin_atual: consultor.pin_atual,
      proximo_pin: proximaGraduacao.pin,
      progresso: (ciclosValidos / proximaGraduacao.ciclos_necessarios) * 100
    };

  } catch (error) {
    console.error('❌ Erro ao calcular pontos:', error);
    throw error;
  }
}

// ================================================
// 4. UPGRADE AUTOMÁTICO DE PIN
// ================================================

export async function checkAndUpgradePin(consultorId: string): Promise<boolean> {
  try {
    const pontos = await calculateCareerPoints(consultorId);
    
    if (pontos.progresso >= 100) {
      // Consultor atingiu meta!
      await upgradePin(consultorId, pontos.proximo_pin);
      
      // Buscar recompensa do novo PIN
      const recompensa = await getPinReward(pontos.proximo_pin);
      
      // Creditar recompensa na wallet
      await creditWallet(consultorId, recompensa, `Recompensa PIN ${pontos.proximo_pin}`);
      
      // Notificar consultor
      await notifyPinUpgrade(consultorId, pontos.proximo_pin, recompensa);
      
      return true;
    }
    
    return false;

  } catch (error) {
    console.error('❌ Erro ao verificar upgrade de PIN:', error);
    return false;
  }
}

// ================================================
// HELPERS - SUPABASE
// ================================================

async function registerSale(sale: SaleData): Promise<{ sale_id: string }> {
  // TODO: Implementar INSERT no Supabase
  console.log('📝 Registrando venda:', sale);
  return { sale_id: sale.sale_id };
}

async function findOpenCycle(consultorId: string): Promise<CycleStatus | null> {
  // TODO: SELECT no Supabase
  console.log('🔍 Buscando ciclo aberto para:', consultorId);
  return null;
}

async function createNewCycle(consultorId: string): Promise<CycleStatus> {
  // TODO: INSERT no Supabase
  console.log('➕ Criando novo ciclo para:', consultorId);
  return {
    cycle_id: 'new-cycle-id',
    consultor_id: consultorId,
    slots_filled: 0,
    slots_total: 6,
    status: 'open',
    completed: false
  };
}

async function fillCycleSlot(cycleId: string, slot: number, saleId: string): Promise<void> {
  // TODO: UPDATE no Supabase
  console.log(`📍 Preenchendo slot ${slot} do ciclo ${cycleId}`);
}

async function completeCycle(cycleId: string): Promise<void> {
  // TODO: UPDATE status='completed' no Supabase
  console.log('✅ Ciclo completado:', cycleId);
}

async function awardCareerPoint(consultorId: string, cycleId: string): Promise<void> {
  const url = process.env.SUPABASE_URL as string
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY) as string
  if (!url || !key) { console.warn('⚠️  Supabase env ausente para awardCareerPoint'); return }
  const supabase = createClient(url, key)
  const { data: consultor } = await supabase
    .from('consultores')
    .select('id, career_points')
    .eq('id', consultorId)
    .single()
  const current = Number((consultor as any)?.career_points || 0)
  await supabase
    .from('consultores')
    .update({ career_points: current + 1, updated_at: new Date().toISOString() })
    .eq('id', consultorId)
  await supabase
    .from('cycle_events')
    .insert({ cycle_id: cycleId, consultor_id: consultorId, event_type: 'career_point_awarded', event_data: { points_added: 1 } })
}

async function logCycleEvent(event: any): Promise<void> {
  // TODO: INSERT em cycle_events
  console.log('📊 Evento registrado:', event);
}

async function getAllOpenCycles(): Promise<CycleStatus[]> {
  // TODO: SELECT no Supabase
  return [];
}

async function getDaysSinceLastSale(cycleId: string): Promise<number> {
  // TODO: Calcular diferença de datas
  return 0;
}

async function notifyNearCompletion(consultorId: string, slotsFilled: number): Promise<void> {
  console.log(`🔔 Notificar ${consultorId}: Ciclo em ${slotsFilled}/6`);
}

async function notifyStagnantCycle(consultorId: string, days: number): Promise<void> {
  console.log(`⚠️ Notificar ${consultorId}: Ciclo parado há ${days} dias`);
}

async function getConsultorData(consultorId: string): Promise<any> {
  // TODO: SELECT no Supabase
  return {
    id: consultorId,
    pin_atual: 'Safira',
    pin_nivel: 4
  };
}

async function getCyclesByDirectLines(consultorId: string): Promise<{ linha: number; ciclos: number }[]> {
  const url = process.env.SUPABASE_URL as string
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY) as string
  if (!url || !key) return []
  const sb = createClient(url, key)
  const { data: directs } = await sb.from('consultores').select('id').eq('patrocinador_id', consultorId)
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
  const children = new Map<string, string[]>()
  const { data: all } = await sb.from('consultores').select('id, patrocinador_id')
  for (const c of (all || [])) {
    const pid = String((c as any).patrocinador_id || '')
    const cid = String((c as any).id)
    if (!pid) continue
    const arr = children.get(pid) || []
    arr.push(cid)
    children.set(pid, arr)
  }
  function teamOf(root: string): string[] {
    const team: string[] = [root]
    const q: string[] = [...(children.get(root) || [])]
    while (q.length) {
      const cur = q.shift() as string
      team.push(cur)
      const kids = children.get(cur) || []
      for (const k of kids) q.push(k)
    }
    return team
  }
  const lines: { linha: number; ciclos: number }[] = []
  let idx = 1
  for (const d of (directs || [])) {
    const root = String((d as any).id)
    const team = teamOf(root)
    const { data: evs } = await sb
      .from('cycle_events')
      .select('consultor_id, event_type, created_at')
      .eq('event_type', 'cycle_completed')
      .gte('created_at', monthStart)
      .lt('created_at', monthEnd)
      .in('consultor_id', team)
    const cycles = (evs || []).length
    lines.push({ linha: idx, ciclos: cycles })
    idx++
  }
  return lines
}

function getVMECConfig() { return { linhas_requeridas: 0, percentuais: [] } }

async function getNextGraduation(currentPin: number, ciclosAtuais: number): Promise<any> {
  // TODO: Buscar em carreira.json
  const graduacoes: Record<number, any> = {
    4: { pin: 'Esmeralda', ciclos_necessarios: 300 },
    5: { pin: 'Topázio', ciclos_necessarios: 500 }
  };
  return graduacoes[currentPin + 1] || graduacoes[currentPin];
}

async function upgradePin(consultorId: string, novoPin: string): Promise<void> {
  console.log(`🎖️ Upgrade de PIN: ${consultorId} → ${novoPin}`);
}

async function getPinReward(pin: string): Promise<number> {
  const rewards: Record<string, number> = {
    'Esmeralda': 810.00,
    'Topázio': 1350.00
  };
  return rewards[pin] || 0;
}

async function creditWallet(consultorId: string, valor: number, descricao: string): Promise<void> {
  console.log(`💰 Creditar ${valor} para ${consultorId}: ${descricao}`);
}

async function notifyPinUpgrade(consultorId: string, novoPin: string, recompensa: number): Promise<void> {
  console.log(`🎉 Notificar upgrade: ${consultorId} → ${novoPin} (R$ ${recompensa})`);
}

// ================================================
// EXPORTS
// ================================================

export default {
  processSale,
  checkPendingCycles,
  calculateCareerPoints,
  checkAndUpgradePin
};
