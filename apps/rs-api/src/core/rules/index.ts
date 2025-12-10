export * from "./sigmeRules";
export * from "./fidelityRules";
export * from "./topSigmaRules";
export * from "./careerRules";

import { validateSigmeRules } from "./sigmeRules";
import { validateFidelityRules } from "./fidelityRules";
import { validateTopSigmaRules } from "./topSigmaRules";
import { validateCareerRules } from "./careerRules";

/**
 * Valida TODAS as regras operacionais
 */
export function validateAllRules() {
  console.log("🔍 Validando regras operacionais...\n");

  validateSigmeRules();
  validateFidelityRules();
  validateTopSigmaRules();
  validateCareerRules();

  console.log("\n✅ TODAS as regras operacionais validadas com sucesso!");
}
