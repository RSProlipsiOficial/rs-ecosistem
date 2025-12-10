import "dotenv/config";
import { validateAllRules } from "./index";
import { sigmeRules } from "./sigmeRules";
import { fidelityRules } from "./fidelityRules";
import { topSigmaRules } from "./topSigmaRules";
import { careerRules } from "./careerRules";

console.log("🧪 TESTE DAS REGRAS OPERACIONAIS\n");
console.log("=".repeat(60));

try {
  // Valida todas as regras
  validateAllRules();

  console.log("\n" + "=".repeat(60));
  console.log("\n📋 RESUMO DAS REGRAS:\n");

  // SIGME
  console.log("🔷 MATRIZ SIGME:");
  console.log(`   • Estrutura: ${sigmeRules.structure.levelsStructural} nível, ${sigmeRules.structure.slotsPerCycle} slots`);
  console.log(`   • Reentrada: R$ ${sigmeRules.reentry.minPersonalPurchaseBRL},00`);
  console.log(`   • Bônus Ciclo: ${sigmeRules.cyclePayout.pct}%`);
  console.log(`   • Profundidade: L1-L${sigmeRules.depthPayout.levels} (${sigmeRules.depthPayout.totalPct}%)`);

  // Fidelidade
  console.log("\n💛 FIDELIDADE:");
  console.log(`   • Pool: ${fidelityRules.poolPct}%`);
  console.log(`   • Diretos obrigatórios: ${fidelityRules.unlock.requiresDirects ? "SIM ❌" : "NÃO ✅"}`);
  console.log(`   • Desbloqueio: ${fidelityRules.unlock.byReentry ? "Por reentrada ✅" : "Outro"}`);
  console.log(`   • Alcance: L1-L${fidelityRules.depthLevels}`);

  // Top SIGME
  console.log("\n🏆 TOP SIGME:");
  console.log(`   • Pool: ${topSigmaRules.poolPct}%`);
  console.log(`   • Diretos obrigatórios: ${topSigmaRules.qualification.requiresDirects ? "SIM ❌" : "NÃO ✅"}`);
  console.log(`   • Alcance: L1-L${topSigmaRules.depthLevels}`);
  console.log(`   • Sem limite lateral: ${topSigmaRules.rankCounting.noWidthLimit ? "SIM ✅" : "NÃO ❌"}`);
  console.log(`   • Sem limite profundidade: ${topSigmaRules.rankCounting.noDepthLimit ? "SIM ✅" : "NÃO ❌"}`);
  console.log(`   • Conta para ranking: ${topSigmaRules.rankCounting.includesInCareer ? "SIM ✅" : "NÃO ❌"}`);

  // Carreira
  console.log("\n📈 CARREIRA:");
  console.log(`   • Profundidade ilimitada: ${careerRules.limits.unlimitedDepth ? "SIM ✅" : "NÃO ❌"}`);
  console.log(`   • Lateralidade ilimitada: ${careerRules.limits.unlimitedWidth ? "SIM ✅" : "NÃO ❌"}`);
  console.log(`   • VME habilitado: ${careerRules.vme.enabled ? "SIM ✅" : "NÃO ❌"}`);
  console.log(`   • Conta para rank: ${careerRules.countsForRank.join(", ")}`);

  console.log("\n" + "=".repeat(60));
  console.log("\n✅ TODAS AS REGRAS ESTÃO CORRETAS!\n");

} catch (error: any) {
  console.error("\n❌ ERRO NA VALIDAÇÃO:");
  console.error(error.message);
  console.log("\n" + "=".repeat(60));
  process.exit(1);
}
