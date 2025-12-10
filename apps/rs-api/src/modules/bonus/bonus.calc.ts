import { computeDepthBonuses, computeCyclePayout } from "../../core/sigmaMath";

/**
 * Cálculos detalhados de bônus
 */
export async function calculateDepthBonus(level: number) {
  const bonuses = await computeDepthBonuses();
  return bonuses.find(b => b.level === level) || null;
}

export async function calculateTotalEarnings(cycleCount: number) {
  const cycleBonus = await computeCyclePayout();
  const depthBonuses = await computeDepthBonuses();
  const totalDepth = depthBonuses.reduce((sum, b) => sum + b.amount, 0);
  return {
    cycleCount,
    perCycle: { cycle: cycleBonus, depth: totalDepth },
    total: {
      cycle: +(cycleBonus * cycleCount).toFixed(2),
      depth: +(totalDepth * cycleCount).toFixed(2),
      grand: +((cycleBonus + totalDepth) * cycleCount).toFixed(2),
    },
  };
}
