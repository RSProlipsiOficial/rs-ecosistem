// rs-api/src/config/marketingRules.schema.ts
export type BRL = number;        // valores monetários em reais (ex.: 360)
export type Percentage = number; // ex.: 6.81 = 6,81%

export interface SigmaMatrix {
  label: "6x6";
  width: 6;
  depth: 6;
  levelTargets: [6, 36, 216, 1296, 7776, 46656]; // metas por nível
}

/**
 * Bônus de Profundidade:
 * - totalPct se aplica SOBRE a base do ciclo (R$360)
 * - weights repartem esse total por nível (L1..L6)
 * - dispara quando cada downline CLICA (evento de ciclo fechado)
 */
export interface DepthDistribution {
  weights: [7, 8, 10, 15, 25, 35]; // soma 100 (L1..L6)
  totalPct: 6.81;                  // % total distribuída
}

/**
 * Fidelidade (POOL 1,25%):
 * - Sem exigência de diretos.
 * - Desbloqueio por reentrada: N desbloqueia N-1 (no 10º, libera 9 e 10).
 * - A compra de R$60 (reciclo) é o gatilho operacional.
 */
export interface FidelityRule {
  poolPct: Percentage;             // 1,25%
  unlockRule: "N_unlocks_N_minus_1";
  minPersonalPurchaseBRL: BRL;     // R$60 (reciclo/reativação)
}

/**
 * Top SIGMA (POOL 4,5%):
 * - Sem exigência de diretos.
 * - Distribuição por pesos relativos TOP10 (normalizados em runtime).
 */
export interface TopSigmaRule {
  poolPct: Percentage;             // 4,5%
  top10Weights: [2.0, 1.5, 1.2, 1.0, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];
}

/**
 * Rank do Plano de Carreira
 */
export interface CareerRank {
  name: string;                    // Ex: "Bronze", "Prata", "Diamante Black"
  cycles: number;                  // Ciclos necessários no trimestre
  minDirects: number;              // Linhas diretas mínimas
  vmec: number[];                  // Volume Máximo por Equipe e Ciclo (%)
  reward: BRL;                     // Recompensa em R$
}

/**
 * Plano de Carreira:
 * - 13 PINs oficiais
 * - Período trimestral
 * - 6,39% sobre R$360 = R$23,00 por ciclo
 */
export interface CareerPlan {
  enabled: true;
  binaryPercent: Percentage;       // 6,39%
  accumulationWindow: "quarterly";
  ranks: CareerRank[];             // 13 PINs oficiais
}

/**
 * Regras gerais de Marketing usadas pela API
 */
export interface MarketingRules {
  version: string;

  // Base do ciclo
  kitValueBRL: BRL;                // R$60
  cycleBaseBRL: BRL;               // R$360 (6×R$60)
  cyclePayoutPct: Percentage;      // 30% (R$108)

  // Matriz/estrutura SIGMA
  sigma: SigmaMatrix;

  // Profundidade (níveis L1..L6) sobre a base (R$360)
  depth: DepthDistribution;

  // Fidelidade (pool global) — sem diretos
  fidelity: FidelityRule;

  // Top SIGMA (pool global) — sem diretos
  topSigma: TopSigmaRule;

  // Qualificação da MATRIZ (apenas aqui se usa diretos)
  directsRequired: number;         // 6 diretos (para o ciclo/matriz)
  reentryLimit: number;            // até 10
  activationMonthly: true;         // ativação mensal

  // Pontuação
  pointPerBRL: 1;                  // 1 ponto = R$1

  // Carreira (moldura)
  career: CareerPlan;
}
