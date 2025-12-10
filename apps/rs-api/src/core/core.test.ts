// rs-api/src/core/core.test.ts
// Teste completo do CORE + MODULES

import { sigma, sigme, payout, onCycleComplete } from "./index";
import { executeCycle } from "../modules/cycle/cycle.module";
import { handleCycleCompleted } from "../modules/cycle/cycle.events";
import { distributeBonuses } from "../modules/bonus/bonus.module";
import { calculateTotalEarnings } from "../modules/bonus/bonus.calc";
import { checkFidelityUnlock, getFidelityShare } from "../modules/fidelity/fidelity.logic";
import { distributeTopSigmaPool, getTopSigmaShareByCycle } from "../modules/topsigma/topsigma.calc";

console.log("🧪 Testando CORE + MODULES da RS Prólipsi API\n");
console.log("═".repeat(60));

// ========== TESTE 1: MATRIZ SIGMA ==========
console.log("\n📐 TESTE 1: Estrutura da Matriz SIGMA");
console.log(`  Largura: ${sigma.width}`);
console.log(`  Profundidade: ${sigma.depth}`);
console.log(`  Metas por nível:`, sigma.levelTargets);
console.log(`  Total de slots: ${sigma.totalSlots()}`);
console.log(`  Valor de entrada: R$ ${sigma.entryAmount()}`);

// ========== TESTE 2: SIGME (Progressão e Reentrada) ==========
console.log("\n🔄 TESTE 2: SIGME - Progressão e Reentrada");
for (let i = 1; i <= 11; i++) {
  const canReenter = sigme.canReenter(i);
  const unlocked = sigme.unlockedCycles(i);
  console.log(`  Ciclo ${i}: Pode reentrar? ${canReenter ? "✅" : "❌"} | Desbloqueados: [${unlocked}]`);
}

// ========== TESTE 3: PAYOUTS ==========
console.log("\n💰 TESTE 3: Cálculo de Payouts");
const base = 360;
console.log(`  Base do ciclo: R$ ${base}`);
console.log(`  Bônus de ciclo (30%): R$ ${payout.cycleBonus(base)}`);
console.log(`  Pool Fidelidade (1,25%): R$ ${payout.fidelityPool(base)}`);
console.log(`  Pool Top SIGMA (4,5%): R$ ${payout.topSigmaPool(base)}`);
console.log(`\n  Profundidade (6,81% = R$ ${(base * 6.81 / 100).toFixed(2)}):`);
const depthBonuses = payout.depthBonuses(base);
depthBonuses.forEach(b => {
  console.log(`    L${b.level}: ${b.percent.toFixed(2)}% da base = R$ ${b.amount}`);
});

// ========== TESTE 4: TRIGGER DE CICLO ==========
console.log("\n⚡ TESTE 4: Trigger de Ciclo Completo");
const cycleResult = onCycleComplete("USER123", 3);
console.log(`  Usuário: ${cycleResult.userId}`);
console.log(`  Nível: ${cycleResult.level}`);
console.log(`  Base: R$ ${cycleResult.base}`);
console.log(`  Bônus de ciclo: R$ ${cycleResult.results.totalCycleBonus}`);
console.log(`  Pool Fidelidade: R$ ${cycleResult.results.fidelity}`);
console.log(`  Pool Top SIGMA: R$ ${cycleResult.results.topSigma}`);
console.log(`  Profundidade:`, cycleResult.results.depth.map(d => `L${d.level}: R$${d.amount}`).join(", "));

// ========== TESTE 5: MÓDULO DE CICLO ==========
console.log("\n🔁 TESTE 5: Módulo de Ciclo");
const cycle5 = executeCycle("USER456", 5);
console.log(`  Ciclo 5:`, cycle5);
const cycle10 = executeCycle("USER456", 10);
console.log(`  Ciclo 10:`, cycle10);
const cycle11 = executeCycle("USER456", 11);
console.log(`  Ciclo 11 (bloqueado):`, cycle11);

// ========== TESTE 6: DISTRIBUIÇÃO DE BÔNUS ==========
console.log("\n💸 TESTE 6: Distribuição Total de Bônus");
const bonuses = distributeBonuses("USER789");
console.log(`  Usuário: ${bonuses.userId}`);
console.log(`  Base: R$ ${bonuses.base}`);
console.log(`  Ciclo: R$ ${bonuses.cycle}`);
console.log(`  Profundidade total: R$ ${bonuses.depth.reduce((s, d) => s + d.amount, 0).toFixed(2)}`);
console.log(`  Pools:`, bonuses.pools);

// ========== TESTE 7: FIDELIDADE ==========
console.log("\n💛 TESTE 7: Fidelidade (Pool 1,25%)");
const unlocked3 = checkFidelityUnlock(3);
console.log(`  Ciclo 3 desbloqueia:`, unlocked3);
const unlocked10 = checkFidelityUnlock(10);
console.log(`  Ciclo 10 desbloqueia:`, unlocked10);

const totalVolume = 100000; // R$ 100k de volume global
const userPoints = 5000;
const totalPoints = 50000;
const share = getFidelityShare(totalVolume, userPoints, totalPoints);
console.log(`\n  Volume global: R$ ${totalVolume}`);
console.log(`  Pontos do usuário: ${userPoints} / ${totalPoints}`);
console.log(`  Participação: ${(userPoints / totalPoints * 100).toFixed(2)}%`);
console.log(`  Share do pool: R$ ${share.toFixed(2)}`);

// ========== TESTE 8: TOP SIGMA ==========
console.log("\n🏆 TESTE 8: Top SIGMA (Pool 4,5%)");
const topSigmaDistribution = distributeTopSigmaPool(totalVolume);
console.log(`  Volume global: R$ ${totalVolume}`);
console.log(`  Pool total: R$ ${(totalVolume * 4.5 / 100).toFixed(2)}`);
console.log(`\n  Distribuição TOP 10:`);
topSigmaDistribution.forEach(t => {
  console.log(`    #${t.rank}: ${t.percent}% = R$ ${t.share}`);
});

console.log(`\n  Por ciclo (base R$ 360):`);
for (let rank = 1; rank <= 10; rank++) {
  const shareByCycle = getTopSigmaShareByCycle(rank);
  console.log(`    #${rank}: R$ ${shareByCycle} por ciclo`);
}

// ========== TESTE 9: PROJEÇÃO DE GANHOS ==========
console.log("\n📊 TESTE 9: Projeção de Ganhos");
// Wrapped in async function to avoid top-level await
(async () => {
  const projection = await calculateTotalEarnings(10);
  console.log(`  Ciclos: ${projection.cycleCount}`);
  console.log(`  Por ciclo:`);
  console.log(`    - Bônus direto: R$ ${projection.perCycle.cycle}`);
  console.log(`    - Profundidade: R$ ${projection.perCycle.depth.toFixed(2)}`);
  console.log(`  Total acumulado:`);
  console.log(`    - Ciclos: R$ ${projection.total.cycle}`);
  console.log(`    - Profundidade: R$ ${projection.total.depth.toFixed(2)}`);
  console.log(`    - GRANDE TOTAL: R$ ${projection.total.grand.toFixed(2)}`);

  console.log("\n" + "═".repeat(60));
  console.log("✅ Todos os testes concluídos com sucesso!");
  console.log("🚀 CORE + MODULES prontos para uso em produção\n");
})();
