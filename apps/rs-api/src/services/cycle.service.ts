import { sigme } from "../core/sigme";
import { payout } from "../core/payouts";

export function executeCycle(userId: string, currentCycle: number) {
  if (!sigme.canReenter(currentCycle)) {
    return {
      userId,
      currentCycle,
      status: "blocked",
      message: "Limite de reentradas atingido.",
    };
  }

  const base = 360;
  const gain = payout.cycleBonus(base);
  const unlocked = sigme.unlockedCycles(currentCycle);

  return {
    userId,
    currentCycle,
    base,
    gain,
    unlocked,
    status: "ok",
  };
}
