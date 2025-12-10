/**
 * Orquestrador de Cálculo de Bônus
 * Centraliza lógica de todos os tipos de bônus
 */

import { CONSTANTS } from '../../utils/math';
import { logEvent } from '../../utils/log';

export interface BonusBreakdown {
  ciclo: number;
  profundidade: number;
  fidelidade: number;
  topSigma: number;
  carreira: number;
  total: number;
}

/**
 * Calcula todos os bônus de um ciclo completo
 */
export function calculateAllBonuses(cycleBaseBRL: number = CONSTANTS.CYCLE_BASE_BRL): BonusBreakdown {
  const breakdown: BonusBreakdown = {
    ciclo: CONSTANTS.CYCLE_PAYOUT_BRL,        // R$ 108,00 (30%)
    profundidade: CONSTANTS.DEPTH_TOTAL_BRL,  // R$ 24,52 (6,81%)
    fidelidade: CONSTANTS.FIDELITY_POOL_BRL,  // R$ 4,50 (1,25%)
    topSigma: CONSTANTS.TOP_SIGMA_POOL_BRL,   // R$ 16,20 (4,5%)
    carreira: CONSTANTS.CAREER_BRL,            // R$ 23,00 (6,39%)
    total: 0,
  };

  breakdown.total = 
    breakdown.ciclo +
    breakdown.profundidade +
    breakdown.fidelidade +
    breakdown.topSigma +
    breakdown.carreira;

  logEvent("bonus.calculated", breakdown);

  return breakdown;
}

/**
 * Valida se os percentuais estão corretos
 */
export function validateBonusPercentages(): boolean {
  const total = 
    CONSTANTS.CYCLE_PAYOUT_PCT +      // 30%
    CONSTANTS.DEPTH_TOTAL_PCT +       // 6,81%
    CONSTANTS.FIDELITY_POOL_PCT +     // 1,25%
    CONSTANTS.TOP_SIGMA_POOL_PCT +    // 4,5%
    CONSTANTS.CAREER_PCT;              // 6,39%

  // Total: 48,95%
  const expected = 48.95;
  const isValid = Math.abs(total - expected) < 0.01;

  logEvent("bonus.validation", {
    total,
    expected,
    isValid,
  });

  if (!isValid) {
    console.warn(`⚠️ Soma dos percentuais: ${total}% (esperado: ${expected}%)`);
  }

  return isValid;
}

/**
 * Resumo visual dos bônus
 */
export function printBonusBreakdown(): void {
  const breakdown = calculateAllBonuses();

  console.log("\n" + "=".repeat(60));
  console.log("💰 BREAKDOWN DE BÔNUS - RS PRÓLIPSI");
  console.log("=".repeat(60));
  console.log(`Base do Ciclo:     R$ ${CONSTANTS.CYCLE_BASE_BRL.toFixed(2)}`);
  console.log("─".repeat(60));
  console.log(`Ciclo (30%):       R$ ${breakdown.ciclo.toFixed(2)}`);
  console.log(`Profundidade:      R$ ${breakdown.profundidade.toFixed(2)} (L1-L6)`);
  console.log(`Fidelidade:        R$ ${breakdown.fidelidade.toFixed(2)} (Pool)`);
  console.log(`Top SIGMA:         R$ ${breakdown.topSigma.toFixed(2)} (Top 10)`);
  console.log(`Carreira:          R$ ${breakdown.carreira.toFixed(2)} (VME)`);
  console.log("─".repeat(60));
  console.log(`TOTAL DISTRIBUÍDO: R$ ${breakdown.total.toFixed(2)}`);
  console.log("=".repeat(60) + "\n");
}
