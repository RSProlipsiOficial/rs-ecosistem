import { rules } from "../config";

/**
 * Estrutura da matriz SIGMA (6x6)
 * Cada consultor precisa de 6 diretos ativos para qualificar o ciclo.
 * Cada nível é multiplicado pela base (6).
 */
export const sigma = {
  width: rules.sigma.width,
  depth: rules.sigma.depth,
  levelTargets: rules.sigma.levelTargets,

  totalSlots() {
    return this.levelTargets.reduce((sum, n) => sum + n, 0);
  },

  entryAmount() {
    return rules.cycleBaseBRL;
  },
};
