/**
 * RS PRÓLIPSI - DISTRIBUIÇÃO DE BÔNUS
 * Matemática completa baseada no plano de marketing oficial
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
  cycle_value: number; // 360.00
}

// ================================================
// 1. BÔNUS DE CICLO (30% = R$ 108)
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
// 2. BÔNUS DE PROFUNDIDADE (6.81% = R$ 24.52)
// ================================================

export async function calculateDepthBonus(
  cycleValue: number,
  uplines: { id: string; nivel: number }[]
): Promise<BonusDistribution> {
  const cfg = await getSigmaConfigCore();
  const basePool = cycleValue * (cfg.depthBonus.basePercent / 100);
  const weights = cfg.depthBonus.levels.map(l => l.percent);
  const sum = weights.reduce((a, b) => a + b, 0);
  const beneficiarios: Beneficiario[] = [];
  let targetLevel = 1;
  let index = 0;
  let lastEligible: { id: string; nivel: number } | undefined;
  while (targetLevel <= cfg.depthBonus.levels.length && index < uplines.length) {
    const intendedCfg = cfg.depthBonus.levels.find(l => l.level === targetLevel);
    const intendedWeight = intendedCfg ? intendedCfg.percent : 0;
    // compressão dinâmica: procurar próximo upline elegível (ativo na matriz base)
    let chosen: { id: string; nivel: number } | undefined;
    while (index < uplines.length) {
      const candidate = uplines[index++];
      if (await isActiveInMatrixBase(candidate.id)) { chosen = candidate; break; }
    }
    if (!chosen) { targetLevel++; continue; }
    lastEligible = chosen;
    const sharePct = (intendedWeight / sum) * 100;
    const valor = +((basePool * intendedWeight) / sum).toFixed(2);
    beneficiarios.push({ consultor_id: chosen.id, nivel: targetLevel, valor, percentual: +sharePct.toFixed(5) });
    targetLevel++;
  }
  // Se faltou alocar níveis e há pelo menos um elegível, alocar remanescentes no último elegível
  while (targetLevel <= cfg.depthBonus.levels.length && lastEligible) {
    const intendedCfg = cfg.depthBonus.levels.find(l => l.level === targetLevel);
    const intendedWeight = intendedCfg ? intendedCfg.percent : 0;
    const sharePct = (intendedWeight / sum) * 100;
    const valor = +((basePool * intendedWeight) / sum).toFixed(2);
    beneficiarios.push({ consultor_id: lastEligible.id, nivel: targetLevel, valor, percentual: +sharePct.toFixed(5) });
    targetLevel++;
  }
  const totalValor = beneficiarios.reduce((s, b) => s + b.valor, 0);
  return { tipo: 'profundidade', valor: totalValor, percentual: cfg.depthBonus.basePercent, beneficiarios };
}

// ================================================
// 3. POOL DE FIDELIDADE (1.25% = R$ 4.50)
// ================================================

export async function calculateFidelityPool(
  cycleValue: number,
  uplines: { id: string; nivel: number }[]
): Promise<BonusDistribution> {
  const cfg = await getSigmaConfigCore();
  const basePool = +(cycleValue * (cfg.fidelityBonus.percentTotal / 100)).toFixed(2);
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
    const sharePct = (intendedWeight / sum) * 100;
    const valor = +((basePool * intendedWeight) / sum).toFixed(2);
    beneficiarios.push({ consultor_id: chosen.id, nivel: targetLevel, valor, percentual: +sharePct.toFixed(5) });
    targetLevel++;
  }
  while (targetLevel <= (cfg.fidelityBonus.levels || []).length && lastEligible) {
    const intendedCfg = cfg.fidelityBonus.levels?.find(l => l.level === targetLevel);
    const intendedWeight = intendedCfg ? intendedCfg.percent : 0;
    const sharePct = (intendedWeight / sum) * 100;
    const valor = +((basePool * intendedWeight) / sum).toFixed(2);
    beneficiarios.push({ consultor_id: lastEligible.id, nivel: targetLevel, valor, percentual: +sharePct.toFixed(5) });
    targetLevel++;
  }
  return { tipo: 'fidelidade', valor: basePool, percentual: cfg.fidelityBonus.percentTotal, beneficiarios };
}

// ================================================
// 4. POOL TOP SIGMA (4.5% = R$ 16.20)
// ================================================

export async function calculateTopSigmaPool(
  totalCyclesValue: number,
  topConsultores: { id: string; posicao: number }[]
): Promise<BonusDistribution> {
  const cfg = await getSigmaConfigCore();
  const totalPool = +(totalCyclesValue * (cfg.topSigma.percentTotal / 100)).toFixed(2);
  const mapRanks = new Map(cfg.topSigma.ranks.map(r => [r.rank, r.percent]));
  const beneficiarios: Beneficiario[] = [];
  for (const c of topConsultores) {
    if (!(await isActiveInMatrixBase(c.id))) continue;
    const pct = mapRanks.get(c.posicao) || 0;
    const valor = +(totalPool * (pct / 100)).toFixed(2);
    beneficiarios.push({ consultor_id: c.id, valor, percentual: pct });
  }
  return { tipo: 'top_sigma', valor: totalPool, percentual: cfg.topSigma.percentTotal, beneficiarios };
}

// ================================================
// 5. BÔNUS DE CARREIRA (6.39% = R$ 23)
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
  const percentual = cfg.career.percentTotal;
  const valorPorCiclo = cfg.career.valuePerCycle;

  const pinCfg = cfg.career.pins.find(p => p.orderIndex === consultor.pin_nivel);
  const vmecConfig: VMECConfig = pinCfg
    ? {
      linhas_requeridas: pinCfg.minLinesRequired,
      percentuais: String(pinCfg.vmecDistribution)
        .split(/[\/|,]/)
        .map(s => parseFloat(String(s).trim()))
        .filter(n => !isNaN(n))
    }
    : { linhas_requeridas: 0, percentuais: [] };

  const ciclosValidos = calculateValidCycles(consultor.linhas_diretas, vmecConfig);
  const valor = +(ciclosValidos * valorPorCiclo).toFixed(2);

  return {
    tipo: 'carreira',
    valor,
    percentual,
    beneficiarios: [{ consultor_id: consultor.id, valor, percentual }]
  };
}

// ================================================
// VMEC - VOLUME MÁXIMO POR EQUIPE E CICLO
// ================================================

interface VMECConfig {
  linhas_requeridas: number;
  percentuais: number[];
}

function getVMECForPin() { return { linhas_requeridas: 0, percentuais: [] } }

/**
 * Calcula ciclos válidos aplicando VMEC
 * 
 * REGRAS:
 * 1. Pode ter INFINITAS linhas (sem limite)
 * 2. NENHUMA linha pode exceder seu percentual máximo
 * 3. Se alguma linha exceder, aplica o limite APENAS naquela linha
 * 4. Precisa ter pelo menos o número mínimo de linhas ativas
 * 
 * Exemplo Rubi [50%, 30%, 20%]:
 * - 10 linhas, todas dentro do limite → conta TODAS
 * - 3 linhas: L1=60%, L2=30%, L3=10% → L1 limita em 50%
 */
function calculateValidCycles(
  linhas: { linha: number; ciclos: number }[],
  vmec: VMECConfig
): number {
  // Se não tem VMEC configurado (Bronze), conta tudo
  if (vmec.linhas_requeridas === 0 || vmec.percentuais.length === 0) {
    return linhas.reduce((sum, l) => sum + l.ciclos, 0);
  }

  // Filtrar linhas com ciclos > 0
  const linhasAtivas = linhas.filter(l => l.ciclos > 0);

  // Verificar se tem o mínimo de linhas requeridas
  if (linhasAtivas.length < vmec.linhas_requeridas) {
    // Não qualifica! Precisa ter o número mínimo de linhas
    return 0;
  }

  // Calcular total geral de ciclos (TODAS as linhas)
  const totalCiclos = linhas.reduce((sum, l) => sum + l.ciclos, 0);

  // Aplicar VMEC: verificar cada linha individualmente
  let ciclosValidos = 0;

  for (const linha of linhas) {
    if (linha.ciclos === 0) continue;

    // Calcular percentual que esta linha representa
    const percentualLinha = (linha.ciclos / totalCiclos) * 100;

    // Encontrar o limite máximo permitido para qualquer linha
    // (pega o MAIOR percentual disponível, pois pode ter infinitas linhas)
    const limiteMaximo = Math.max(...vmec.percentuais);
    const limiteCiclos = Math.floor(totalCiclos * (limiteMaximo / 100));

    // Se a linha está dentro do limite, conta tudo
    // Se excedeu, limita ao máximo permitido
    if (linha.ciclos <= limiteCiclos) {
      ciclosValidos += linha.ciclos;
    } else {
      ciclosValidos += limiteCiclos;
    }
  }

  return ciclosValidos;
}

/**
 * Valida se a distribuição de linhas está adequada para o VMEC
 * Retorna se qualifica + detalhes
 */
function validateVMECDistribution(
  linhas: { linha: number; ciclos: number }[],
  vmec: VMECConfig
): {
  qualifica: boolean;
  motivo?: string;
  ciclos_validos: number;
  linhas_ativas: number;
  linhas_requeridas: number;
} {
  const linhasAtivas = linhas.filter(l => l.ciclos > 0);

  if (linhasAtivas.length < vmec.linhas_requeridas) {
    return {
      qualifica: false,
      motivo: `Precisa ter pelo menos ${vmec.linhas_requeridas} linhas ativas. Você tem ${linhasAtivas.length}.`,
      ciclos_validos: 0,
      linhas_ativas: linhasAtivas.length,
      linhas_requeridas: vmec.linhas_requeridas
    };
  }

  const ciclosValidos = calculateValidCycles(linhas, vmec);

  return {
    qualifica: true,
    ciclos_validos: ciclosValidos,
    linhas_ativas: linhasAtivas.length,
    linhas_requeridas: vmec.linhas_requeridas
  };
}

// ================================================
// EXEMPLO DE USO
// ================================================

/**
 * Exemplo: Consultor Safira (PIN 4) com 2 linhas
 * Linha 1: 100 ciclos
 * Linha 2: 50 ciclos
 * Total: 150 ciclos
 * 
 * VMEC Safira: [60%, 40%]
 * Linha 1 conta até: 150 * 0.60 = 90 ciclos (mas tem 100, então usa 90)
 * Linha 2 conta até: 150 * 0.40 = 60 ciclos (mas tem 50, então usa 50)
 * Ciclos válidos: 90 + 50 = 140 ciclos
 * 
 * Bônus carreira: 140 * R$ 23 = R$ 3.220
 */

// ================================================
// DISTRIBUIÇÃO COMPLETA
// ================================================

export async function distributeAllBonuses(cycle: CycleData) {
  const distributions: BonusDistribution[] = [];

  // 1. Bônus de Ciclo (30%)
  const cycleBonus = await calculateCycleBonus(cycle.cycle_value);
  distributions.push(cycleBonus);

  // 2. Bônus de Profundidade (6.81%)
  // Buscar uplines do consultor (L1-L6)
  const uplines = await getUplines(cycle.consultor_id, 6);
  const depthBonus = await calculateDepthBonus(cycle.cycle_value, uplines);
  distributions.push(depthBonus);

  // 3. Pool de Fidelidade (1.25%)
  // Buscar consultores elegíveis que fizeram reentrada
  const fidelityBonus = await calculateFidelityPool(cycle.cycle_value, uplines);
  distributions.push(fidelityBonus);

  // 4. Pool Top SIGMA (4.5%)
  // Calcular no final do mês com todos os ciclos
  // distributions.push(topSigmaBonus);

  // 5. Bônus de Carreira (6.39%)
  const consultorData = await getConsultorCareerData(cycle.consultor_id);
  const careerBonus = await calculateCareerBonus(cycle.cycle_value, consultorData);
  distributions.push(careerBonus);

  return distributions;
}

// ================================================
// HELPERS (implementar com Supabase)
// ================================================

async function getUplines(consultorId: string, levels: number): Promise<{ id: string; nivel: number }[]> {
  const url = process.env.SUPABASE_URL as string
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY) as string
  if (!url || !key) return []
  const sb = createClient(url, key)
  const chain: { id: string; nivel: number }[] = []
  let current = consultorId
  let nivel = 1
  while (nivel <= levels) {
    const { data } = await sb
      .from('downlines')
      .select('upline_id')
      .eq('downline_id', current)
      .limit(1)
      .maybeSingle()
    const up = (data as any)?.upline_id
    if (!up) break
    chain.push({ id: String(up), nivel })
    current = String(up)
    nivel++
  }
  return chain
}

// fidelidade usa uplines e compressão dinâmica com níveis configurados

async function getConsultorCareerData(consultorId: string) {
  // TODO: Buscar dados do consultor e linhas diretas
  return {
    id: consultorId,
    pin_nivel: 4,
    linhas_diretas: [
      { linha: 1, ciclos: 100 },
      { linha: 2, ciclos: 50 }
    ]
  };
}

// ================================================
// VALIDAÇÃO
// ================================================

export function validateTotalDistribution(distributions: BonusDistribution[]): boolean {
  const total = distributions.reduce((sum, d) => sum + d.percentual, 0);
  const expected = 48.95; // 30 + 6.81 + 1.25 + 4.5 + 6.39

  const isValid = Math.abs(total - expected) < 0.01;

  if (!isValid) {
    console.error(`❌ Distribuição inválida: ${total}% (esperado: ${expected}%)`);
  }

  return isValid;
}

export default {
  calculateCycleBonus,
  calculateDepthBonus,
  calculateFidelityPool,
  calculateTopSigmaPool,
  calculateCareerBonus,
  calculateValidCycles,
  validateVMECDistribution,
  distributeAllBonuses,
  validateTotalDistribution
};
