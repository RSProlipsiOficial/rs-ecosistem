import { rules } from "../../config";

/**
 * Regras da Matriz SIGME
 * Lê as configurações consolidadas do marketingRules
 */
export const sigmeRules = {
  /**
   * Estrutura da matriz
   */
  structure: {
    levelsStructural: 1,
    slotsPerCycle: rules.sigma.width, // 6 posições
  },

  /**
   * Reentrada
   */
  reentry: {
    enabled: true,
    minPersonalPurchaseBRL: rules.kitValueBRL, // R$ 60
  },

  /**
   * Bônus de Profundidade quando downlines ciclam
   * Alcance: L1 até L6
   */
  depthPayout: {
    levels: 6, // matrixCycleDepthLevels
    weights: rules.depth.weights, // Usa % já definidas
    totalPct: rules.depth.totalPct, // 6.81%
  },

  /**
   * Bônus do Ciclo
   */
  cyclePayout: {
    pct: rules.cyclePayoutPct, // 30%
    baseBRL: rules.cycleBaseBRL, // R$ 360
  },
};

/**
 * Validações
 */
export function validateSigmeRules() {
  if (sigmeRules.structure.slotsPerCycle !== 6) {
    throw new Error("SIGME deve ter exatamente 6 slots");
  }

  if (sigmeRules.reentry.minPersonalPurchaseBRL <= 0) {
    throw new Error("Valor mínimo de reentrada deve ser > 0");
  }

  if (sigmeRules.depthPayout.levels !== 6) {
    throw new Error("Profundidade da SIGME deve ser 6 níveis");
  }

  console.log("✅ Regras SIGME validadas");
}
