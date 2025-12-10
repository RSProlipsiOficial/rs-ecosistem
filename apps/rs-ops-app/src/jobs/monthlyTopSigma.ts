/**
 * Job Mensal: Distribuição Pool Top SIGMA
 * Roda todo dia 1º do mês
 */

import { distributeTopSigmaPool } from '../core/distribution/payTopSigma';
import { logEvent } from '../utils/log';
import { CONSTANTS } from '../utils/math';

export async function monthlyTopSigma(): Promise<void> {
  try {
    logEvent("job.monthly.topsigma.start", { 
      date: new Date().toISOString() 
    });

    console.log("🏆 Iniciando distribuição mensal Top SIGMA...");

    // TODO: Calcular pool acumulado do mês
    // Por enquanto usa valor base
    const totalPool = CONSTANTS.TOP_SIGMA_POOL_BRL * 100; // Exemplo: 100 ciclos

    await distributeTopSigmaPool(totalPool);

    console.log("✅ Distribuição mensal Top SIGMA concluída");

    logEvent("job.monthly.topsigma.complete", { 
      date: new Date().toISOString(),
      totalPool 
    });

  } catch (error: any) {
    logEvent("job.monthly.topsigma.error", { 
      error: error.message 
    });
    throw error;
  }
}
