import { payout } from "../../core/payouts";

export function distributeBonuses(userId: string) {
  const base = 360;
  const depth = payout.depthBonuses(base);
  const fidelity = payout.fidelityPool(base);
  const topSigma = payout.topSigmaPool(base);
  const cycle = payout.cycleBonus(base);

  return {
    userId,
    base,
    cycle,
    depth,
    pools: { fidelity, topSigma },
  };
}
