/**
 * RS PRÓLIPSI - ENGINE TOP SIGMA
 * Motor de distribuição do pool 4,5% por 10 níveis
 */

import topSigmaConfig from '../../../rs-config/src/settings/topSigma.json';

export interface CycleLedgerEntry {
  id: string;
  user_id: string;
  cycle_value: number;
  team_level: number;
  upline_id?: string;
  closed_at: Date;
}

export interface TopSigmaDistribution {
  period: string;
  poolBase: number;
  poolAmount: number;
  levelBreakdown: LevelBreakdown[];
  payouts: TopSigmaPayout[];
  totalDistributed: number;
  remainder: number;
}

export interface LevelBreakdown {
  level: number;
  weight: number;
  cycles: number;
  poolAmount: number;
  consultores: number;
}

export interface TopSigmaPayout {
  userId: string;
  level: number;
  userCyclesAtLevel: number;
  levelTotalCycles: number;
  levelPoolAmount: number;
  grossShare: number;
  finalShare: number;
}

/**
 * Valida configuração do TOP SIGMA
 */
export function validateTopSigmaConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validar soma dos pesos
  const sumWeights = topSigmaConfig.levelWeights.weights.reduce((a, b) => a + b, 0);
  if (Math.abs(sumWeights - 1.0) > 0.001) {
    errors.push(`Soma dos pesos deve ser 1.0. Atual: ${sumWeights}`);
  }
  
  // Validar pool pct
  if (topSigmaConfig.payout.poolPct !== 0.045) {
    errors.push(`Pool deve ser 4.5%. Atual: ${topSigmaConfig.payout.poolPct * 100}%`);
  }
  
  // Validar 10 níveis
  if (topSigmaConfig.levelWeights.weights.length !== 10) {
    errors.push(`Deve haver 10 níveis. Atual: ${topSigmaConfig.levelWeights.weights.length}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calcula distribuição do TOP SIGMA
 */
export function calculateTopSigmaDistribution(
  period: string,
  cycles: CycleLedgerEntry[]
): TopSigmaDistribution {
  
  // 1. Calcular base do pool
  const poolBase = cycles.reduce((sum, c) => sum + c.cycle_value, 0);
  const poolAmount = poolBase * topSigmaConfig.payout.poolPct;
  
  // 2. Agrupar ciclos por nível
  const cyclesByLevel: Record<number, CycleLedgerEntry[]> = {};
  for (let i = 1; i <= 10; i++) {
    cyclesByLevel[i] = cycles.filter(c => c.team_level === i);
  }
  
  // 3. Calcular breakdown por nível
  const levelBreakdown: LevelBreakdown[] = [];
  const payouts: TopSigmaPayout[] = [];
  
  for (let level = 1; level <= 10; level++) {
    const levelCycles = cyclesByLevel[level];
    const levelWeight = topSigmaConfig.levelWeights.weights[level - 1];
    const levelPoolAmount = poolAmount * levelWeight;
    const totalCyclesLevel = levelCycles.length;
    
    levelBreakdown.push({
      level,
      weight: levelWeight,
      cycles: totalCyclesLevel,
      poolAmount: levelPoolAmount,
      consultores: new Set(levelCycles.map(c => c.user_id)).size
    });
    
    if (totalCyclesLevel === 0) continue;
    
    // 4. Distribuir proporcionalmente
    const userCyclesAtLevel: Record<string, number> = {};
    levelCycles.forEach(c => {
      userCyclesAtLevel[c.user_id] = (userCyclesAtLevel[c.user_id] || 0) + 1;
    });
    
    for (const [userId, userCycles] of Object.entries(userCyclesAtLevel)) {
      const grossShare = (userCycles / totalCyclesLevel) * levelPoolAmount;
      const finalShare = applyRounding(grossShare, topSigmaConfig.rounding.mode);
      
      payouts.push({
        userId,
        level,
        userCyclesAtLevel: userCycles,
        levelTotalCycles: totalCyclesLevel,
        levelPoolAmount,
        grossShare,
        finalShare
      });
    }
  }
  
  // 5. Calcular total distribuído e resto
  const totalDistributed = payouts.reduce((sum, p) => sum + p.finalShare, 0);
  const remainder = poolAmount - totalDistributed;
  
  return {
    period,
    poolBase,
    poolAmount,
    levelBreakdown,
    payouts,
    totalDistributed,
    remainder
  };
}

/**
 * Aplica arredondamento conforme configuração
 */
function applyRounding(value: number, mode: string): number {
  switch (mode) {
    case 'floor_centavo':
      return Math.floor(value * 100) / 100;
    case 'ceil_centavo':
      return Math.ceil(value * 100) / 100;
    case 'round_centavo':
      return Math.round(value * 100) / 100;
    default:
      return Math.floor(value * 100) / 100;
  }
}

/**
 * Filtra consultores elegíveis
 */
export function filterEligibleConsultores(
  payouts: TopSigmaPayout[],
  consultores: Record<string, { isActive: boolean; hasKyc: boolean; status: string }>
): { eligible: TopSigmaPayout[]; onHold: TopSigmaPayout[] } {
  
  const eligible: TopSigmaPayout[] = [];
  const onHold: TopSigmaPayout[] = [];
  
  payouts.forEach(payout => {
    const consultor = consultores[payout.userId];
    
    if (!consultor) {
      onHold.push(payout);
      return;
    }
    
    const isEligible = 
      (!topSigmaConfig.eligibility.mustBeActive || consultor.isActive) &&
      (!topSigmaConfig.eligibility.kycWalletPay || consultor.hasKyc) &&
      (!topSigmaConfig.eligibility.excludeSuspended || consultor.status !== 'suspenso');
    
    if (isEligible) {
      eligible.push(payout);
    } else {
      onHold.push(payout);
    }
  });
  
  return { eligible, onHold };
}

/**
 * Gera relatório do TOP SIGMA
 */
export function generateTopSigmaReport(distribution: TopSigmaDistribution): string {
  let report = '';
  
  report += '='.repeat(70) + '\n';
  report += 'TOP SIGMA - RELATÓRIO DE DISTRIBUIÇÃO\n';
  report += '='.repeat(70) + '\n';
  report += `Período: ${distribution.period}\n`;
  report += `Pool Base: R$ ${distribution.poolBase.toFixed(2)}\n`;
  report += `Pool Amount (4.5%): R$ ${distribution.poolAmount.toFixed(2)}\n`;
  report += `Total Distribuído: R$ ${distribution.totalDistributed.toFixed(2)}\n`;
  report += `Resto: R$ ${distribution.remainder.toFixed(2)}\n`;
  report += '\n';
  
  report += 'BREAKDOWN POR NÍVEL:\n';
  report += '-'.repeat(70) + '\n';
  distribution.levelBreakdown.forEach(lb => {
    report += `L${lb.level}: ${lb.cycles} ciclos, ${lb.consultores} consultores, `;
    report += `peso ${(lb.weight * 100).toFixed(1)}%, pool R$ ${lb.poolAmount.toFixed(2)}\n`;
  });
  
  report += '\n';
  report += `TOTAL DE PAYOUTS: ${distribution.payouts.length}\n`;
  report += '='.repeat(70) + '\n';
  
  return report;
}

export default {
  validateTopSigmaConfig,
  calculateTopSigmaDistribution,
  filterEligibleConsultores,
  generateTopSigmaReport
};
