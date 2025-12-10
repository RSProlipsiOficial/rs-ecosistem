import { payout } from "../../core/payouts";
import { sigme } from "../../core/sigme";

/**
 * Gerencia a execução de ciclos
 */
export function executeCycle(userId: string, currentCycle: number) {
  if (!sigme.canReenter(currentCycle)) {
    return { status: "blocked", message: "Limite de 10 reentradas atingido." };
  }

  const base = 360;
  const gain = payout.cycleBonus(base);

  return {
    userId,
    currentCycle,
    gain,
    unlocked: sigme.unlockedCycles(currentCycle),
  };
}
