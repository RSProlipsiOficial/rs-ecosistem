import { rules } from "../config";
import { payout } from "./payouts";

/**
 * Dispara eventos quando um usuário cicla:
 * - paga bônus de ciclo (R$108)
 * - paga profundidade (6,81%)
 * - adiciona valores nos pools (1,25% e 4,5%)
 */
export function onCycleComplete(userId: string, level: number) {
  const base = rules.cycleBaseBRL;
  const totalCycleBonus = payout.cycleBonus(base);
  const depth = payout.depthBonuses(base);
  const fidelity = payout.fidelityPool(base);
  const topSigma = payout.topSigmaPool(base);

  return {
    userId,
    level,
    base,
    results: { totalCycleBonus, depth, fidelity, topSigma },
  };
}
