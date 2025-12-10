import { rules } from "../../config";

/**
 * Calcula a distribuição do pool TopSIGMA (4,5%)
 */
export function distributeTopSigmaPool(totalVolumeBRL: number) {
  const pool = totalVolumeBRL * (rules.topSigma.poolPct / 100);
  const weights = rules.topSigma.top10Weights;
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  return weights.map((w, i) => ({
    rank: i + 1,
    percent: +(w / totalWeight * 100).toFixed(2),
    share: +(pool * (w / totalWeight)).toFixed(2),
  }));
}

/**
 * Calcula quanto cada posição do TOP 10 recebe por ciclo
 */
export function getTopSigmaShareByCycle(rank: number, cycleBaseBRL: number = 360) {
  const pool = cycleBaseBRL * (rules.topSigma.poolPct / 100);
  const weights = rules.topSigma.top10Weights;
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  
  if (rank < 1 || rank > 10) return 0;
  
  const weight = weights[rank - 1];
  return +(pool * (weight / totalWeight)).toFixed(2);
}
