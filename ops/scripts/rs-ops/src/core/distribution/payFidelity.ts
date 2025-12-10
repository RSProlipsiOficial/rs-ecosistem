/**
 * Pagamento de Bônus de Fidelidade (Pool)
 * 
 * VALORES OFICIAIS:
 * - Pool: 1,25% sobre R$ 360 = R$ 4,50
 * - Distribuição: L1-L6 com pesos [7, 8, 10, 15, 25, 35]
 * 
 * DESBLOQUEIO:
 * - Por reentrada (comprou R$ 60 → participa)
 * - SEM exigência de diretos
 * - Regra: N desbloqueia N-1
 * 
 * QUANDO PAGA:
 * - Mensal ou por reentrada (conforme configuração)
 */

import { getUpline, saveBonus } from '../../services/supabaseService';
import { processPayment } from '../../services/walletService';
import { CONSTANTS, DEPTH_WEIGHTS } from '../../utils/math';
import { logEvent } from '../../utils/log';
import { formatBRL } from '../../utils/format';

export async function payFidelity(consultorId: string, cycleData: any): Promise<void> {
  try {
    logEvent("fidelity.start", { consultorId, cycleId: cycleData.id });

    // Busca upline até L6
    const upline = await getUpline(consultorId, 6);

    if (upline.length === 0) {
      logEvent("fidelity.no_upline", { consultorId });
      return;
    }

    const FIDELITY_TOTAL = CONSTANTS.FIDELITY_POOL_BRL; // R$ 4,50

    // Distribui proporcionalmente por nível
    for (let level = 1; level <= upline.length; level++) {
      const sponsor = upline[level - 1];
      const weight = DEPTH_WEIGHTS[level - 1]; // 7, 8, 10, 15, 25, 35
      const bonusValue = (FIDELITY_TOTAL * weight) / 100;

      if (bonusValue <= 0) continue;

      // Registra bônus no banco
      await saveBonus({
        consultor_id: sponsor.id,
        tipo: 'FIDELIDADE',
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
        type: 'FIDELIDADE',
        description: `Pool de Fidelidade L${level} - Reentrada de ${consultorId}`,
        metadata: {
          level,
          weight,
          sourceCycle: cycleData.id,
          sourceConsultor: consultorId,
        },
      });

      logEvent("fidelity.paid", {
        sponsor: sponsor.id,
        level,
        valor: bonusValue,
        weight,
        sourceConsultor: consultorId,
      });

      console.log(`💛 Fidelidade L${level}: ${formatBRL(bonusValue)} → ${sponsor.name || sponsor.id}`);
    }

    logEvent("fidelity.complete", {
      consultorId,
      levelsProcessed: upline.length,
      totalPaid: FIDELITY_TOTAL,
    });

  } catch (error: any) {
    logEvent("fidelity.error", { consultorId, error: error.message });
    throw error;
  }
}
