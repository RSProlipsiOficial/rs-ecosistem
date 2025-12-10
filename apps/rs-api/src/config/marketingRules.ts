// rs-api/src/config/marketingRules.ts
import type { MarketingRules } from "./marketingRules.schema";

/**
 * REGRAS OFICIAIS – RS PRÓLIPSI (ajustado conforme orientação):
 * - Top SIGMA: sem exigência de diretos.
 * - Fidelidade: sem exigência de diretos; desbloqueio por reentrada (compra R$60).
 * - Profundidade: paga quando cada downline CLICA (evento de ciclo), por nível L1..L6.
 * - Matriz/Ciclo SIGMA: qualificação com 6 diretos (apenas para o ciclo/matriz).
 */
export const rules: MarketingRules = {
  version: "1.0.1",

  // Base do ciclo (confirmado)
  kitValueBRL: 60,
  cycleBaseBRL: 360,
  cyclePayoutPct: 30, // 30% de 360 = 108

  // Matriz SIGMA (6x6, metas por nível)
  sigma: {
    label: "6x6",
    width: 6,
    depth: 6,
    levelTargets: [6, 36, 216, 1296, 7776, 46656],
  },

  // Profundidade (total 6,81% com pesos L1..L6 = [7,8,10,15,25,35])
  depth: {
    weights: [7, 8, 10, 15, 25, 35],
    totalPct: 6.81,
  },

  // Fidelidade (POOL 1,25%) — SEM diretos; destrava por reentrada de R$60 (N → N-1)
  fidelity: {
    poolPct: 1.25,
    unlockRule: "N_unlocks_N_minus_1",
    minPersonalPurchaseBRL: 60,
  },

  // Top SIGMA (POOL 4,5%) — SEM diretos
  topSigma: {
    poolPct: 4.5,
    top10Weights: [2.0, 1.5, 1.2, 1.0, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3],
  },

  // Qualificação da MATRIZ (apenas aqui se usa diretos)
  directsRequired: 6,
  reentryLimit: 10,
  activationMonthly: true,

  // Pontuação
  pointPerBRL: 1,

  // Carreira (trimestral; 13 PINs oficiais - 6,39% sobre R$360 = R$23/ciclo)
  career: {
    enabled: true,
    binaryPercent: 6.39,
    accumulationWindow: "quarterly",
    ranks: [
      {
        name: "Bronze",
        cycles: 5,
        minDirects: 0,
        vmec: [],
        reward: 13.50,
      },
      {
        name: "Prata",
        cycles: 15,
        minDirects: 1,
        vmec: [100],
        reward: 40.50,
      },
      {
        name: "Ouro",
        cycles: 70,
        minDirects: 1,
        vmec: [100],
        reward: 189.00,
      },
      {
        name: "Safira",
        cycles: 150,
        minDirects: 2,
        vmec: [60, 40],
        reward: 405.00,
      },
      {
        name: "Esmeralda",
        cycles: 300,
        minDirects: 2,
        vmec: [60, 40],
        reward: 810.00,
      },
      {
        name: "Topázio",
        cycles: 500,
        minDirects: 2,
        vmec: [60, 40],
        reward: 1350.00,
      },
      {
        name: "Rubi",
        cycles: 750,
        minDirects: 3,
        vmec: [50, 30, 20],
        reward: 2025.00,
      },
      {
        name: "Diamante",
        cycles: 1500,
        minDirects: 3,
        vmec: [50, 30, 20],
        reward: 4050.00,
      },
      {
        name: "Duplo Diamante",
        cycles: 3000,
        minDirects: 4,
        vmec: [40, 30, 20, 10],
        reward: 18450.00,
      },
      {
        name: "Triplo Diamante",
        cycles: 5000,
        minDirects: 5,
        vmec: [35, 25, 20, 10, 10],
        reward: 36450.00,
      },
      {
        name: "Diamante Red",
        cycles: 15000,
        minDirects: 6,
        vmec: [30, 20, 18, 12, 10, 10, 1],
        reward: 67500.00,
      },
      {
        name: "Diamante Blue",
        cycles: 25000,
        minDirects: 6,
        vmec: [30, 20, 18, 12, 10, 10, 1],
        reward: 105300.00,
      },
      {
        name: "Diamante Black",
        cycles: 50000,
        minDirects: 6,
        vmec: [30, 20, 18, 12, 10, 10, 1],
        reward: 135000.00,
      },
    ],
  },
};
