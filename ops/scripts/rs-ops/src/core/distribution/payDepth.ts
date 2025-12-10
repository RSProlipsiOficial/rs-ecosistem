/**
 * Pagamento de Bônus de Profundidade
 * 
 * VALORES OFICIAIS:
 * - Total: 6,81% sobre R$ 360 = R$ 24,52
 * - Distribuição: L1-L6 com pesos [7, 8, 10, 15, 25, 35]
 * 
 * PAGA QUANDO:
 * - Um downline (direto ou indireto) fecha um ciclo
 * - Alcance: até 6 níveis acima
 * - SEM exigência de diretos
 */

import { getUpline, saveBonus } from '../../services/supabaseService';
import { processPayment } from '../../services/walletService';
import { calculateDepthBonus, CONSTANTS } from '../../utils/math';
import { logEvent } from '../../utils/log';
import { formatBRL } from '../../utils/format';

export async function payDepth(consultorId: string, cycleData: any): Promise<void> {
  try {
    logEvent("depth.start", { consultorId, cycleId: cycleData.id });

    // Busca upline até L6
    const upline = await getUpline(consultorId, 6);

    if (upline.length === 0) {
      logEvent("depth.no_upline", { consultorId });
      return;
    }

    // Paga cada nível
    for (let level = 1; level <= upline.length; level++) {
      const sponsor = upline[level - 1];
      const bonusValue = calculateDepthBonus(level);

      if (bonusValue <= 0) continue;

      // Registra bônus no banco
      await saveBonus({
        consultor_id: sponsor.id,
        tipo: 'PROFUNDIDADE',
        nivel: level,
        valor: bonusValue,
        origem_ciclo_id: cycleData.id,
        origem_consultor_id: consultorId,
        data: new Date().toISOString(),
        status: 'APROVADO',
      });

      // Processa pagamento
      await processPayment({
        consultorId: sponsor.id,
        amount: bonusValue,
        type: 'PROFUNDIDADE',
        description: `Bônus de Profundidade L${level} - Ciclo de ${consultorId}`,
        metadata: {
          level,
          sourceCycle: cycleData.id,
          sourceConsultor: consultorId,
        },
      });

      logEvent("depth.paid", {
        sponsor: sponsor.id,
        level,
        valor: bonusValue,
        sourceConsultor: consultorId,
      });

      console.log(`💰 L${level}: ${formatBRL(bonusValue)} → ${sponsor.name || sponsor.id}`);
    }

    logEvent("depth.complete", {
      consultorId,
      levelsProcessed: upline.length,
      totalPaid: CONSTANTS.DEPTH_TOTAL_BRL,
    });

  } catch (error: any) {
    logEvent("depth.error", { consultorId, error: error.message });
    throw error;
  }
}
