/**
 * RS PRÓLIPSI - OPS
 * Motor Operacional do Sistema
 * 
 * Gerencia:
 * - Fechamento de ciclos
 * - Distribuição de bônus
 * - Jobs automáticos
 * - Validações
 * - CRONs agendados
 * - Monitoramento
 */

import dotenv from 'dotenv';
dotenv.config();

// Core
import { closeCycle } from "./core/cycles/closeCycle";
import { openCycle } from "./core/cycles/openCycle";
import { reentryCycle } from "./core/cycles/reentryCycle";
import { payDepth } from "./core/distribution/payDepth";
import { payFidelity } from "./core/distribution/payFidelity";
import { payTopSigma } from "./core/distribution/payTopSigma";
import { checkActive } from "./core/validation/checkActive";
import { checkReentry } from "./core/validation/checkReentry";
import { checkQualified } from "./core/validation/checkQualified";

// Jobs
import { dailySettlement } from "./jobs/dailySettlement";
import { weeklyFidelity } from "./jobs/weeklyFidelity";
import { monthlyTopSigma } from "./jobs/monthlyTopSigma";
import { recalcBonuses } from "./jobs/recalcBonuses";
import { updateRanks } from "./jobs/updateRanks";
import { cleanLogs } from "./jobs/cleanLogs";
import { backupWallets } from "./jobs/backupWallets";

// CRONs
import { activateMatrizCron } from "./crons/activateMatriz";
import { resetMonthlyCountersCron } from "./crons/resetMonthlyCounters";
import { payFidelityPoolCron } from "./crons/payFidelityPool";
import { payTopSigmaPoolCron } from "./crons/payTopSigmaPool";

// Utils
import { printBonusBreakdown, validateBonusPercentages } from "./core/distribution/calculateBonus";
import { logEvent } from "./utils/log";

/**
 * Orquestrador principal
 */
export async function runOps(eventType: string, payload: any): Promise<void> {
  try {
    logEvent("ops.event", { eventType, payload });

    switch (eventType) {
      case "cycle.close":
        await closeCycle(payload.consultorId);
        break;

      case "cycle.open":
        await openCycle(payload);
        break;

      case "cycle.reentry":
        await reentryCycle(payload);
        break;

      case "job.daily":
        await dailySettlement();
        break;

      case "job.weekly":
        await weeklyFidelity();
        break;

      case "job.monthly":
        await monthlyTopSigma();
        break;

      case "job.recalc":
        await recalcBonuses();
        break;

      case "job.ranks":
        await updateRanks();
        break;

      case "job.cleanup":
        await cleanLogs();
        break;

      case "job.backup":
        await backupWallets();
        break;

      default:
        console.warn(`⚠️ Evento desconhecido: ${eventType}`);
        logEvent("ops.unknown_event", { eventType });
    }

    // Validação pós-operação
    if (payload?.consultorId) {
      await checkActive(payload.consultorId);
    }

  } catch (error: any) {
    logEvent("ops.error", { 
      eventType, 
      error: error.message 
    });
    throw error;
  }
}

/**
 * Inicializa CRONs
 */
function initCrons(): void {
  console.log("\n⏰ Configurando CRONs...");
  
  activateMatrizCron();
  resetMonthlyCountersCron();
  payFidelityPoolCron();
  payTopSigmaPoolCron();
  
  console.log("✅ CRONs configurados\n");
}

/**
 * Inicialização
 */
export function init(): void {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 RS PRÓLIPSI - OPS");
  console.log("Motor Operacional Iniciado");
  console.log("=".repeat(60) + "\n");

  // Valida percentuais
  const isValid = validateBonusPercentages();
  if (!isValid) {
    console.warn("⚠️ ATENÇÃO: Percentuais de bônus não conferem!");
  }

  // Mostra breakdown
  printBonusBreakdown();

  // Inicializa CRONs
  initCrons();

  logEvent("ops.init", { 
    timestamp: new Date().toISOString(),
    cronsEnabled: true 
  });

  console.log("✅ Sistema pronto!\n");
}

// Exports
export {
  // Core
  closeCycle,
  openCycle,
  reentryCycle,
  payDepth,
  payFidelity,
  payTopSigma,
  checkActive,
  checkReentry,
  checkQualified,
  // Jobs
  dailySettlement,
  weeklyFidelity,
  monthlyTopSigma,
  recalcBonuses,
  updateRanks,
  cleanLogs,
  backupWallets,
};

// Auto-init
init();
