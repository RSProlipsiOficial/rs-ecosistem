import { rules } from "../config";

/**
 * Controle de progressão SIGME:
 * - Cada ciclo completo (6 diretos ativos) gera nova posição (reentrada).
 * - Reentradas automáticas até o limite definido.
 */
export const sigme = {
  canReenter(currentCycle: number) {
    return currentCycle < rules.reentryLimit;
  },

  nextCycleValue() {
    return rules.cycleBaseBRL;
  },

  // Desbloqueio da fidelidade (N → N-1)
  unlockedCycles(currentCycle: number) {
    if (currentCycle <= 1) return [];
    if (currentCycle >= rules.reentryLimit) return [currentCycle - 1, currentCycle];
    return [currentCycle - 1];
  },
};
