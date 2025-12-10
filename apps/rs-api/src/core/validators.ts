import { rules } from "../config";

/**
 * Valida o plano de marketing na inicialização
 * Lança erro se houver inconsistência
 */
export function validatePlanOrThrow() {
  // Verifica se as regras estão carregadas
  if (!rules || !rules.version) {
    throw new Error("Marketing rules não carregadas");
  }

  // Verifica valores básicos
  if (rules.kitValueBRL <= 0) {
    throw new Error("kitValueBRL deve ser > 0");
  }

  if (rules.cycleBaseBRL <= 0) {
    throw new Error("cycleBaseBRL deve ser > 0");
  }

  // Verifica matriz SIGMA
  if (rules.sigma.width !== 6 || rules.sigma.depth !== 6) {
    throw new Error("Matriz SIGMA deve ser 6x6");
  }

  // Verifica pesos de profundidade
  const depthSum = rules.depth.weights.reduce((a, b) => a + b, 0);
  if (Math.abs(depthSum - 100) > 0.01) {
    throw new Error(`Pesos de profundidade devem somar 100 (atual: ${depthSum})`);
  }

  // Verifica Top SIGMA
  if (rules.topSigma.top10Weights.length !== 10) {
    throw new Error("Top SIGMA deve ter exatamente 10 pesos");
  }

  console.log(`✅ Plano de marketing validado (versão ${rules.version})`);
}
