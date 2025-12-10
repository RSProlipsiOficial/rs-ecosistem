import { rules } from "../config";

/**
 * Distribuição de valores conforme as regras do Plano RS Prólipsi
 */
export const payout = {
  cycleBonus(base: number) {
    return +(base * (rules.cyclePayoutPct / 100)).toFixed(2); // 30% de 360 = 108
  },

  depthBonuses(base: number) {
    const total = (base * rules.depth.totalPct) / 100;
    const weights = rules.depth.weights;
    const weightSum = weights.reduce((a, b) => a + b, 0);
    return weights.map((w, i) => ({
      level: i + 1,
      percent: +(rules.depth.totalPct * (w / weightSum)).toFixed(5),
      amount: +((total * w) / weightSum).toFixed(2),
    }));
  },

  fidelityPool(base: number) {
    return +(base * (rules.fidelity.poolPct / 100)).toFixed(2); // 4,50
  },

  topSigmaPool(base: number) {
    return +(base * (rules.topSigma.poolPct / 100)).toFixed(2); // 16,20
  },
};
