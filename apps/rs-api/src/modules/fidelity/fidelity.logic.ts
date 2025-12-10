import { rules } from "../../config";

/**
 * Controla o desbloqueio de fidelidade:
 * - Ao reciclar (comprar R$60), o usuário ativa novamente o pool
 * - Regra: N desbloqueia N-1
 */
export function checkFidelityUnlock(cycleNumber: number) {
  if (cycleNumber <= 1) return [];
  return [cycleNumber - 1];
}

export function getFidelityShare(totalVolumeBRL: number, userPoints: number, totalPoints: number) {
  if (totalPoints <= 0) return 0;
  const pool = (totalVolumeBRL * (rules.fidelity.poolPct / 100));
  return (pool * userPoints) / totalPoints;
}

/**
 * Verifica se o usuário pode participar do pool de fidelidade
 */
export function canParticipateInFidelity(hasRecycled: boolean, minPurchase: number = 60) {
  return hasRecycled && minPurchase >= rules.fidelity.minPersonalPurchaseBRL;
}
