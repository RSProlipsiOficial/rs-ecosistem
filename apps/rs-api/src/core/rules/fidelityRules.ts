import { rules } from "../../config";

/**
 * Regras do Pool de Fidelidade
 * Lê as configurações consolidadas do marketingRules
 */
export const fidelityRules = {
  /**
   * Percentual do pool
   */
  poolPct: rules.fidelity.poolPct, // 1.25%

  /**
   * Desbloqueio
   */
  unlock: {
    byReentry: true, // Comprou/reciclou → participa
    requiresDirects: false, // SEM exigência de diretos
  },

  /**
   * Alcance em profundidade
   */
  depthLevels: 6, // fidelityDepthLevels

  /**
   * Distribuição por Níveis
   * Mesmos pesos da profundidade (L1-L6)
   */
  distribution: {
    type: "weighted", // Distribuição por pesos
    weights: [7, 8, 10, 15, 25, 35], // L1-L6 (soma 100%)
    minUnlockCycles: 1, // Após 1 ciclo (usa reentrada como gatilho)
  },
};

/**
 * Validações
 */
export function validateFidelityRules() {
  if (fidelityRules.unlock.requiresDirects) {
    throw new Error("❌ FIDELIDADE NÃO PODE EXIGIR DIRETOS");
  }

  if (fidelityRules.poolPct !== 1.25) {
    throw new Error("Pool de Fidelidade deve ser 1.25%");
  }

  if (fidelityRules.depthLevels !== 6) {
    throw new Error("Profundidade da Fidelidade deve ser 6 níveis");
  }

  console.log("✅ Regras de Fidelidade validadas");
}
