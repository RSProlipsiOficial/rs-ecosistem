import { rules } from "../../config";

/**
 * Regras do Plano de Carreira
 * Lê as configurações consolidadas do marketingRules
 */
export const careerRules = {
  /**
   * Limites
   */
  limits: {
    unlimitedDepth: true, // SEM limite de profundidade
    unlimitedWidth: true, // SEM limite de lateralidade
  },

  /**
   * Percentual base
   */
  binaryPercent: rules.career.binaryPercent, // 6,39%

  /**
   * VME (Volume Máximo por Linha)
   */
  vme: {
    enabled: true,
    ranks: rules.career.ranks, // Tabela completa dos 13 PINs
  },

  /**
   * O que conta para ranking
   */
  countsForRank: [
    "sigmeCycles", // Ciclos na matriz (1 ponto/ciclo)
    "fidelityPool", // Pool de Fidelidade
    "topSigmaPool", // Pool Top SIGME
    "personalVolume", // Volume pessoal
    "teamVolume", // Volume de equipe
  ],

  /**
   * Tabela de ranks (13 PINs)
   */
  ranks: rules.career.ranks,

  /**
   * Período de apuração
   */
  period: rules.career.accumulationWindow, // "quarterly"
};

/**
 * Validações
 */
export function validateCareerRules() {
  if (!careerRules.limits.unlimitedDepth || !careerRules.limits.unlimitedWidth) {
    throw new Error("❌ Carreira deve ser SEM limites de profundidade/lateralidade");
  }

  if (!careerRules.vme.enabled) {
    throw new Error("VME deve estar habilitado no plano de carreira");
  }

  if (!careerRules.countsForRank.includes("topSigmaPool")) {
    throw new Error("❌ Top SIGME DEVE contar para ranking");
  }

  if (careerRules.ranks.length !== 13) {
    throw new Error(`❌ Plano de Carreira deve ter exatamente 13 PINs (atual: ${careerRules.ranks.length})`);
  }

  if (careerRules.binaryPercent !== 6.39) {
    throw new Error("❌ Percentual binário deve ser 6,39%");
  }

  if (careerRules.period !== "quarterly") {
    throw new Error("❌ Período de apuração deve ser trimestral");
  }

  console.log("✅ Regras de Carreira validadas (13 PINs configurados)");
}
