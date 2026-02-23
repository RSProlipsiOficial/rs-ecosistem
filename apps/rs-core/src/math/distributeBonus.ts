/**
 * RS PRÓLIPSI - DISTRIBUIÇÃO DE BÔNUS (MOTOR UNIFICADO)
 * Matemática completa baseada no plano de marketing oficial (marketingRules.ts)
 */
import { getSigmaConfigCore } from '../services/sigmaConfigCore'
import { isActiveInMatrixBase } from '../services/sigmaEligibility'
import { createClient } from '@supabase/supabase-js'

// ================================================
// TIPOS
// ================================================

interface BonusDistribution {
  tipo: 'ciclo' | 'profundidade' | 'fidelidade' | 'top_sigma' | 'carreira';
  valor: number;
  percentual: number;
  beneficiarios: Beneficiario[];
}

interface Beneficiario {
  consultor_id: string;
  nivel?: number;
  linha?: number;
  valor: number;
  percentual: number;
}

interface CycleData {
  consultor_id: string;
  cycle_id: string;
  cycle_value: number; // ex: 360.00
}

interface VMECConfig {
  linhas_requeridas: number;
  percentuais: number[];
}

// ================================================
// 1. BÔNUS DE CICLO (30%)
// ================================================

export async function calculateCycleBonus(cycleValue?: number): Promise<BonusDistribution> {
  const cfg = await getSigmaConfigCore();
  const base = cycleValue ?? cfg.cycle.value;
  const percentual = cfg.cycle.payoutPercent;
  const valor = base * (percentual / 100);

  return {
    tipo: 'ciclo',
    valor,
    percentual,
    beneficiarios: []
  };
}

// ================================================
// 2. BÔNUS DE PROFUNDIDADE (6.81% - L1..L6)
// ================================================

export async function calculateDepthBonus(
  cycleValue: number,
  uplines: { id: string; nivel: number }[]
): Promise<BonusDistribution> {
  const cfg = await getSigmaConfigCore();
  const basePool = cycleValue * (cfg.depthBonus.basePercent / 100);
  const weights = cfg.depthBonus.levels.map(l => l.percent);
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const beneficiarios: Beneficiario[] = [];

  let targetLevel = 1;
  let index = 0;
  let lastEligible: { id: string; nivel: number } | undefined;

  while (targetLevel <= cfg.depthBonus.levels.length && index < uplines.length) {
    const intendedCfg = cfg.depthBonus.levels.find(l => l.level === targetLevel);
    const intendedWeight = intendedCfg ? intendedCfg.percent : 0;

    let chosen: { id: string; nivel: number } | undefined;
    while (index < uplines.length) {
      const candidate = uplines[index++];
      if (await isActiveInMatrixBase(candidate.id)) { chosen = candidate; break; }
    }

    if (!chosen) { targetLevel++; continue; }
    lastEligible = chosen;

    const sharePct = (intendedWeight / sum) * 100;
    const valor = +((basePool * intendedWeight) / sum).toFixed(2);
    beneficiarios.push({
      consultor_id: chosen.id,
      nivel: targetLevel,
      valor,
      percentual: +sharePct.toFixed(5)
    });
    targetLevel++;
  }

  // Se houver níveis sem uplines novos, alocar para o último elegível (compressão)
  while (targetLevel <= cfg.depthBonus.levels.length && lastEligible) {
    const intendedCfg = cfg.depthBonus.levels.find(l => l.level === targetLevel);
    const intendedWeight = intendedCfg ? intendedCfg.percent : 0;
    const valor = +((basePool * intendedWeight) / sum).toFixed(2);
    beneficiarios.push({
      consultor_id: lastEligible.id,
      nivel: targetLevel,
      valor,
      percentual: +((intendedWeight / sum) * 100).toFixed(5)
    });
    targetLevel++;
  }

  const totalValor = beneficiarios.reduce((s, b) => s + b.valor, 0);
  return { tipo: 'profundidade', valor: totalValor, percentual: cfg.depthBonus.basePercent, beneficiarios };
}

// ================================================
// 3. POOL DE FIDELIDADE (1.25%)
// ================================================

export async function calculateFidelityPool(
  cycleValue: number,
  uplines: { id: string; nivel: number }[]
): Promise<BonusDistribution> {
  const cfg = await getSigmaConfigCore();
  const poolBase = +(cycleValue * (cfg.fidelityBonus.percentTotal / 100)).toFixed(2);
  const weights = (cfg.fidelityBonus.levels || []).map(l => l.percent);
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const beneficiarios: Beneficiario[] = [];

  let targetLevel = 1;
  let index = 0;
  let lastEligible: { id: string; nivel: number } | undefined;

  while (targetLevel <= (cfg.fidelityBonus.levels || []).length && index < uplines.length) {
    const intendedCfg = cfg.fidelityBonus.levels?.find(l => l.level === targetLevel);
    const intendedWeight = intendedCfg ? intendedCfg.percent : 0;

    let chosen: { id: string; nivel: number } | undefined;
    while (index < uplines.length) {
      const candidate = uplines[index++];
      if (await isActiveInMatrixBase(candidate.id)) { chosen = candidate; break; }
    }

    if (!chosen) { targetLevel++; continue; }
    lastEligible = chosen;

    const valor = +((poolBase * intendedWeight) / sum).toFixed(2);
    beneficiarios.push({
      consultor_id: chosen.id,
      nivel: targetLevel,
      valor,
      percentual: +((intendedWeight / sum) * 100).toFixed(5)
    });
    targetLevel++;
  }

  return { tipo: 'fidelidade', valor: poolBase, percentual: cfg.fidelityBonus.percentTotal, beneficiarios };
}

// ================================================
// 4. BÔNUS DE CARREIRA (ACÚMULO TRIMESTRAL)
// ================================================

export async function calculateCareerBonus(
  cycleValue: number,
  consultor: {
    id: string;
    pin_nivel: number;
    linhas_diretas: { linha: number; ciclos: number }[];
  }
): Promise<BonusDistribution> {
  const cfg = await getSigmaConfigCore();
  if (!(await isActiveInMatrixBase(consultor.id))) {
    return { tipo: 'carreira', valor: 0, percentual: cfg.career.percentTotal, beneficiarios: [] }
  }

  // 1. Encontrar o maior PIN atingido (acumulado no trimestre)
  let bestPin = cfg.career.pins[0]; // Bronze default
  for (const pin of cfg.career.pins) {
    const vmec: VMECConfig = {
      linhas_requeridas: pin.minLinesRequired,
      percentuais: String(pin.vmecDistribution).split(/[\/|,]/).map(Number).filter(n => !isNaN(n))
    };
    const validos = calculateValidCycles(consultor.linhas_diretas, vmec);
    if (validos >= pin.cyclesRequired) {
      bestPin = pin;
    }
  }

  // 2. Verificar já pago no trimestre
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;
  const sb = createClient(url, key);

  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3);
  const quarterStart = new Date(now.getFullYear(), quarter * 3, 1).toISOString();

  const { data: results } = await sb.from('wallet_transactions').select('amount').eq('user_id', consultor.id).eq('type', 'bonus_career').gte('created_at', quarterStart);
  const alreadyPaid = (results || []).reduce((sum, t) => sum + Number(t.amount), 0);

  const toPay = Math.max(0, bestPin.rewardValue - alreadyPaid);

  return {
    tipo: 'carreira',
    valor: +toPay.toFixed(2),
    percentual: cfg.career.percentTotal,
    beneficiarios: toPay > 0 ? [{ consultor_id: consultor.id, valor: +toPay.toFixed(2), percentual: cfg.career.percentTotal }] : []
  };
}

// ================================================
// DISTRIBUIÇÃO E PERSISTÊNCIA COMPLETA
// ================================================

export async function distributeAllBonuses(cycle: CycleData) {
  const distributions: BonusDistribution[] = [];
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;
  const sb = createClient(url, key);

  // 1. Ciclo
  const cycleBonus = await calculateCycleBonus(cycle.cycle_value);
  distributions.push(cycleBonus);

  // 2. Profundidade
  const uplines = await getUplines(cycle.consultor_id, 6);
  const depthBonus = await calculateDepthBonus(cycle.cycle_value, uplines);
  distributions.push(depthBonus);

  // 3. Fidelidade (Pool) - Pendente até reentrada
  const fidelityBonus = await calculateFidelityPool(cycle.cycle_value, uplines);
  distributions.push(fidelityBonus);

  // 4. Carreira
  const consultorData = await getConsultorCareerData(cycle.consultor_id);
  const careerBonus = await calculateCareerBonus(cycle.cycle_value, consultorData);
  distributions.push(careerBonus);

  // 5. Liberação por Reentrada
  const { count: cycleCount } = await sb.from('matriz_cycles').select('*', { count: 'exact', head: true }).eq('consultor_id', cycle.consultor_id).eq('status', 'completed');
  const currentNum = (cycleCount || 0) + 1;
  if (currentNum > 1) {
    await sb.from('wallet_transactions').update({ status: 'completed' }).eq('user_id', cycle.consultor_id).eq('type', 'bonus_fidelity').eq('status', 'pending');
  }

  // 6. Salvar no Banco
  await persistDistributions(sb, distributions, cycle);

  return distributions;
}

async function persistDistributions(sb: any, distributions: BonusDistribution[], cycle: CycleData) {
  for (const dist of distributions) {
    if (dist.tipo === 'ciclo') {
      await creditSingleBonus(sb, cycle.consultor_id, dist.valor, 'bonus_cycle', `Bônus de Ciclo SIGMA`, cycle.cycle_id);
      continue;
    }

    for (const b of dist.beneficiarios) {
      const typeMap: any = { 'profundidade': 'bonus_depth', 'fidelidade': 'bonus_fidelity', 'carreira': 'bonus_career' };
      const type = typeMap[dist.tipo] || dist.tipo;
      const isFid = dist.tipo === 'fidelidade';
      const status = isFid ? 'pending' : 'completed';

      await sb.from('bonuses').insert({ user_id: b.consultor_id, bonus_type: dist.tipo, amount: b.valor, origin_cycle_id: cycle.cycle_id, origin_user_id: cycle.consultor_id, level: b.nivel });

      if (status === 'completed') {
        await creditSingleBonus(sb, b.consultor_id, b.valor, type, `Bônus ${dist.tipo} - Ciclo de ${cycle.consultor_id}`, cycle.cycle_id, b.nivel);
      } else {
        await sb.from('wallet_transactions').insert({ user_id: b.consultor_id, type, amount: b.valor, description: `Bônus Fidelidade (Pendente)`, status: 'pending', metadata: { cycle_id: cycle.cycle_id, level: b.nivel } });
      }
    }
  }
}

async function creditSingleBonus(sb: any, userId: string, amount: number, type: string, description: string, cycleId: string, level?: number) {
  if (amount <= 0) return;
  const { data: wallet } = await sb.from('wallets').select('saldo_disponivel').eq('consultor_id', userId).single();
  const oldBalance = Number(wallet?.saldo_disponivel || 0);
  const newBalance = +(oldBalance + amount).toFixed(2);

  await sb.from('wallet_transactions').insert({ user_id: userId, type, amount, description, status: 'completed', balance_after: newBalance, metadata: { cycle_id: cycleId, level } });
  await sb.from('wallets').update({ saldo_disponivel: newBalance, saldo_total: newBalance, updated_at: new Date().toISOString() }).eq('consultor_id', userId);
}

// ================================================
// HELPERS
// ================================================

export function calculateValidCycles(linhas: { linha: number; ciclos: number }[], vmec: VMECConfig): number {
  if (vmec.linhas_requeridas === 0 || vmec.percentuais.length === 0) return linhas.reduce((s, l) => s + l.ciclos, 0);
  if (linhas.filter(l => l.ciclos > 0).length < vmec.linhas_requeridas) return 0;
  const total = linhas.reduce((s, l) => s + l.ciclos, 0);
  let validos = 0;
  for (const l of linhas) {
    const max = Math.max(...vmec.percentuais);
    const limit = Math.floor(total * (max / 100));
    validos += Math.min(l.ciclos, limit);
  }
  return validos;
}

async function getUplines(id: string, levels: number): Promise<{ id: string; nivel: number }[]> {
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!);
  const chain = []; let cur = id;
  for (let i = 1; i <= levels; i++) {
    const { data } = await sb.from('downlines').select('upline_id').eq('downline_id', cur).maybeSingle();
    const up = (data as any)?.upline_id;
    if (!up) break;
    chain.push({ id: String(up), nivel: i });
    cur = String(up);
  }
  return chain;
}

async function getConsultorCareerData(id: string) {
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!);
  const { data: c } = await sb.from('consultores').select('pin_nivel').eq('id', id).single();
  const now = new Date(); const q = Math.floor(now.getMonth() / 3);
  const start = new Date(now.getFullYear(), q * 3, 1).toISOString();
  const { data: directs } = await sb.from('consultores').select('id').eq('patrocinador_id', id);
  const linhas = [];
  if (directs) {
    for (let i = 0; i < directs.length; i++) {
      const { data: teamIds } = await sb.rpc('get_team_ids', { root_id: directs[i].id });
      const { count } = await sb.from('matriz_cycles').select('*', { count: 'exact', head: true }).in('consultor_id', teamIds || [directs[i].id]).eq('status', 'completed').gte('completed_at', start);
      linhas.push({ linha: i + 1, ciclos: count || 0 });
    }
  }
  return { id, pin_nivel: c?.pin_nivel || 1, linhas_diretas: linhas };
}

export default { distributeAllBonuses };
