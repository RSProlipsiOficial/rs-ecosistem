// rs-api/src/config/marketingRules.test.ts
// Teste rápido das regras de marketing (pode rodar com ts-node)

import { rules } from "./marketingRules";

console.log("🔍 Validando Regras de Marketing RS Prólipsi\n");

// 1. Base do Ciclo
console.log("📦 BASE DO CICLO:");
console.log(`  Kit: R$ ${rules.kitValueBRL}`);
console.log(`  Ciclo (6 kits): R$ ${rules.cycleBaseBRL}`);
console.log(`  Payout (${rules.cyclePayoutPct}%): R$ ${(rules.cycleBaseBRL * rules.cyclePayoutPct) / 100}\n`);

// 2. Matriz SIGMA
console.log("🎯 MATRIZ SIGMA:");
console.log(`  Estrutura: ${rules.sigma.label} (${rules.sigma.width}x${rules.sigma.depth})`);
console.log(`  Metas por nível:`, rules.sigma.levelTargets);
console.log(`  Qualificação: ${rules.directsRequired} diretos\n`);

// 3. Profundidade
console.log(`📊 BÔNUS DE PROFUNDIDADE (${rules.depth.totalPct}%):`);
const depthBase = rules.cycleBaseBRL * (rules.depth.totalPct / 100);
console.log(`  Base: R$ ${depthBase.toFixed(2)} por ciclo`);
console.log(`  Distribuição L1..L6:`);
rules.depth.weights.forEach((w, i) => {
  const pct = (w / 100) * rules.depth.totalPct;
  const value = (pct / 100) * rules.cycleBaseBRL;
  console.log(`    L${i + 1}: ${w}% do total (${pct.toFixed(2)}% da base) = R$ ${value.toFixed(2)}`);
});
console.log();

// 4. Fidelidade
console.log(`💛 FIDELIDADE (POOL ${rules.fidelity.poolPct}%):`);
const fidelityPerCycle = rules.cycleBaseBRL * (rules.fidelity.poolPct / 100);
console.log(`  Pool por ciclo: R$ ${fidelityPerCycle.toFixed(2)}`);
console.log(`  Desbloqueio: ${rules.fidelity.unlockRule}`);
console.log(`  Reciclo mínimo: R$ ${rules.fidelity.minPersonalPurchaseBRL}\n`);

// 5. Top SIGMA
console.log(`🏆 TOP SIGMA (POOL ${rules.topSigma.poolPct}%):`);
const topSigmaPerCycle = rules.cycleBaseBRL * (rules.topSigma.poolPct / 100);
console.log(`  Pool por ciclo: R$ ${topSigmaPerCycle.toFixed(2)}`);
console.log(`  Distribuição TOP10:`, rules.topSigma.top10Weights);
const totalWeight = rules.topSigma.top10Weights.reduce((a, b) => a + b, 0);
console.log(`  Peso total: ${totalWeight}% (normalizado em runtime)\n`);

// 6. Carreira
console.log("🎖️ PLANO DE CARREIRA:");
console.log(`  Status: ${rules.career.enabled ? "Ativo" : "Inativo"}`);
console.log(`  Janela: ${rules.career.accumulationWindow}`);
// console.log(`  Nota: ${rules.career.note}\n`);

// 7. Resumo de Percentuais
console.log("📈 RESUMO DE DISTRIBUIÇÃO:");
const totalDistribution = 
  rules.cyclePayoutPct +
  rules.depth.totalPct +
  rules.fidelity.poolPct +
  rules.topSigma.poolPct;
console.log(`  Ciclo: ${rules.cyclePayoutPct}%`);
console.log(`  Profundidade: ${rules.depth.totalPct}%`);
console.log(`  Fidelidade: ${rules.fidelity.poolPct}%`);
console.log(`  Top SIGMA: ${rules.topSigma.poolPct}%`);
console.log(`  TOTAL: ${totalDistribution.toFixed(2)}%\n`);

console.log("✅ Validação concluída!");
console.log(`📌 Versão das regras: ${rules.version}`);
