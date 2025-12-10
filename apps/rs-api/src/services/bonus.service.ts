import { payout } from "../core/payouts";

export function simulateBonuses(base = 360) {
  const cycle = payout.cycleBonus(base);
  const depth = payout.depthBonuses(base);
  const fidelity = payout.fidelityPool(base);
  const topSigma = payout.topSigmaPool(base);

  const total = +(
    cycle +
    depth.reduce((sum, d) => sum + d.amount, 0) +
    fidelity +
    topSigma
  ).toFixed(2);

  return { base, cycle, depth, fidelity, topSigma, total };
}
