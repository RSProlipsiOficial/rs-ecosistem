/**
 * Funções matemáticas para cálculos de bônus
 * Todos os valores seguem documentação oficial RS Prólipsi
 */

/**
 * Valores oficiais validados
 */
export const CONSTANTS = {
  CYCLE_BASE_BRL: 360.00,       // R$ 360 (ciclo completo)
  REENTRY_BRL: 60.00,            // R$ 60 (reentrada individual)
  CYCLE_PAYOUT_PCT: 30,          // 30% do ciclo
  CYCLE_PAYOUT_BRL: 108.00,      // R$ 108
  DEPTH_TOTAL_PCT: 6.81,         // 6,81% profundidade
  DEPTH_TOTAL_BRL: 24.52,        // R$ 24,52
  FIDELITY_POOL_PCT: 1.25,       // 1,25% pool
  FIDELITY_POOL_BRL: 4.50,       // R$ 4,50
  TOP_SIGMA_POOL_PCT: 4.5,       // 4,5% pool
  TOP_SIGMA_POOL_BRL: 16.20,     // R$ 16,20
  CAREER_PCT: 6.39,              // 6,39% carreira
  CAREER_BRL: 23.00,             // R$ 23
};

/**
 * Pesos de profundidade L1-L6 (soma 100%)
 */
export const DEPTH_WEIGHTS = [7, 8, 10, 15, 25, 35];

/**
 * Pesos Top 10 SIGMA (soma 9%)
 */
export const TOP_10_WEIGHTS = [2.0, 1.5, 1.2, 1.0, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];

/**
 * Calcula bônus de profundidade para um nível específico
 */
export function calculateDepthBonus(level: number): number {
  if (level < 1 || level > 6) return 0;
  
  const weight = DEPTH_WEIGHTS[level - 1];
  const totalBRL = CONSTANTS.DEPTH_TOTAL_BRL;
  
  return (totalBRL * weight) / 100;
}

/**
 * Calcula participação no Top 10
 */
export function calculateTop10Share(position: number, totalPool: number): number {
  if (position < 1 || position > 10) return 0;
  
  const weight = TOP_10_WEIGHTS[position - 1];
  const totalWeight = TOP_10_WEIGHTS.reduce((a, b) => a + b, 0); // 9.0
  
  return (totalPool * weight) / totalWeight;
}

/**
 * Arredonda para 2 casas decimais
 */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calcula porcentagem
 */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return round2((value / total) * 100);
}

/**
 * Valida se valor é positivo
 */
export function isPositive(value: number): boolean {
  return value > 0;
}
