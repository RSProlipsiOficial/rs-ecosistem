import { rules } from "../config";

/**
 * Service: fornece dados do plano atual.
 * É a "porta oficial" da regra de negócio para o front-end.
 */
export function getPlanDetails() {
  return {
    version: rules.version,
    currency: "BRL",
    cycleBase: rules.cycleBaseBRL,
    cyclePayoutPct: rules.cyclePayoutPct,
    depth: rules.depth,
    fidelity: rules.fidelity,
    topSigma: rules.topSigma,
    matrix: {
      directsRequired: rules.directsRequired,
      reentryLimit: rules.reentryLimit,
      activationMonthly: rules.activationMonthly,
    },
    sigma: rules.sigma,
    career: rules.career,
  };
}
