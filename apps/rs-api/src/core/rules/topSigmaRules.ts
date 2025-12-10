import { rules } from "../../config";

/**
 * Regras do Pool Top SIGME
 * Lê as configurações consolidadas do marketingRules
 */
export const topSigmaRules = {
  /**
   * Percentual do pool
   */
  poolPct: rules.topSigma.poolPct, // 4.5%

  /**
   * Distribuição Top 10
   */
  top10Weights: rules.topSigma.top10Weights, // [2.0, 1.5, 1.2, ...]

  /**
   * Alcance em profundidade
   */
  depthLevels: 10, // topSigmaDepthLevels (até L10)

  /**
   * Contagem para rank
   */
  rankCounting: {
    noWidthLimit: true, // SEM limite de lateralidade
    noDepthLimit: true, // SEM limite de profundidade
    includesInCareer: true, // Conta para ranking
  },

  /**
   * Qualificação
   */
  qualification: {
    requiresDirects: false, // SEM exigência de diretos
    minCycles: 1, // Mínimo de ciclos para participar
  },
};

/**
 * Validações
 */
export function validateTopSigmaRules() {
  if (topSigmaRules.qualification.requiresDirects) {
    throw new Error("❌ TOP SIGME NÃO PODE EXIGIR DIRETOS");
  }

  if (topSigmaRules.poolPct !== 4.5) {
    throw new Error("Pool de Top SIGME deve ser 4.5%");
  }

  if (topSigmaRules.depthLevels !== 10) {
    throw new Error("Profundidade do Top SIGME deve ser 10 níveis");
  }

  if (topSigmaRules.top10Weights.length !== 10) {
    throw new Error("Top 10 deve ter exatamente 10 pesos");
  }

  if (!topSigmaRules.rankCounting.noWidthLimit || !topSigmaRules.rankCounting.noDepthLimit) {
    throw new Error("❌ Top SIGME deve contar SEM limites de lateralidade/profundidade");
  }

  console.log("✅ Regras de Top SIGME validadas");
}
