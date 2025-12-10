/**
 * Verifica se consultor pode fazer reentrada
 * Limite: 10 reentradas/mês
 */

import { logEvent } from '../../utils/log';

export async function checkReentry(consultorId: string): Promise<boolean> {
  try {
    // TODO: Buscar contagem de reentradas do mês atual
    // const count = await getMonthlyReentryCount(consultorId);
    const count = 0; // Placeholder

    const canReentry = count < 10;
    
    logEvent("validation.reentry", { 
      consultorId, 
      monthlyCount: count,
      canReentry 
    });

    if (!canReentry) {
      console.warn(`⚠️ Limite de reentradas atingido para ${consultorId} (${count}/10)`);
    }

    return canReentry;

  } catch (error: any) {
    logEvent("validation.reentry.error", { 
      consultorId, 
      error: error.message 
    });
    return false;
  }
}
