/**
 * Pagamento de Bônus Top SIGMA (Pool Global)
 * 
 * VALORES OFICIAIS:
 * - Pool: 4,5% sobre R$ 360 = R$ 16,20
 * - Distribuição: Top 10 com pesos [2.0, 1.5, 1.2, 1.0, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3]
 * 
 * CRITÉRIOS:
 * - SEM exigência de diretos
 * - SEM limite de lateralidade
 * - SEM limite de profundidade
 * - Conta para ranking de carreira
 * 
 * QUANDO PAGA:
 * - Mensal (acumula pool do mês e distribui entre Top 10)
 */

import { getTop10Ranking, saveBonus } from '../../services/supabaseService';
import { processPayment } from '../../services/walletService';
import { calculateTop10Share, CONSTANTS } from '../../utils/math';
import { logEvent } from '../../utils/log';
import { formatBRL } from '../../utils/format';

/**
 * Atualiza ranking com o ciclo atual
 * (incrementa pontos do consultor que ciclou)
 */
export async function payTopSigma(consultorId: string, cycleData: any): Promise<void> {
  try {
    logEvent("topsigma.update_ranking", { consultorId, cycleId: cycleData.id });

    // TODO: Atualizar ranking do consultor
    // Incrementar pontos/ciclos no período atual
    // O pagamento real acontece no job mensal

    logEvent("topsigma.ranking_updated", { consultorId });

  } catch (error: any) {
    logEvent("topsigma.error", { consultorId, error: error.message });
    throw error;
  }
}

/**
 * Distribui pool mensal entre Top 10
 * (chamado pelo job mensal)
 */
export async function distributeTopSigmaPool(totalPoolAmount: number): Promise<void> {
  try {
    logEvent("topsigma.distribute.start", { totalPool: totalPoolAmount });

    // Busca Top 10 do ranking
    const top10 = await getTop10Ranking('monthly');

    if (top10.length === 0) {
      logEvent("topsigma.no_ranking", {});
      return;
    }

    // Distribui entre os Top 10
    for (let position = 1; position <= top10.length; position++) {
      const consultor = top10[position - 1];
      const shareValue = calculateTop10Share(position, totalPoolAmount);

      if (shareValue <= 0) continue;

      // Registra bônus no banco
      await saveBonus({
        consultor_id: consultor.id,
        tipo: 'TOP_SIGMA',
        nivel: null,
        valor: shareValue,
        origem_ciclo_id: null,
        origem_consultor_id: null,
        data: new Date().toISOString(),
        status: 'APROVADO',
        metadata: {
          position,
          totalPool: totalPoolAmount,
          period: 'monthly',
        },
      });

      // Processa pagamento
      await processPayment({
        consultorId: consultor.id,
        amount: shareValue,
        type: 'TOP_SIGMA',
        description: `Pool Top SIGMA - ${position}º lugar`,
        metadata: {
          position,
          totalPool: totalPoolAmount,
        },
      });

      logEvent("topsigma.paid", {
        consultor: consultor.id,
        position,
        valor: shareValue,
      });

      console.log(`🏆 Top ${position}: ${formatBRL(shareValue)} → ${consultor.name || consultor.id}`);
    }

    logEvent("topsigma.distribute.complete", {
      totalPaid: totalPoolAmount,
      recipients: top10.length,
    });

  } catch (error: any) {
    logEvent("topsigma.distribute.error", { error: error.message });
    throw error;
  }
}
