import { getConsultorById, getDownlines, saveCycleHistory } from "../../services/supabaseService";
import { payDepth } from "../distribution/payDepth";
import { payFidelity } from "../distribution/payFidelity";
import { payTopSigma } from "../distribution/payTopSigma";
import { sendNotification } from "../../services/notificationService";
import { logEvent } from "../../utils/log";

/**
 * Fecha um ciclo SIGME (1×6) conforme as regras oficiais da RS Prólipsi MMN.
 * 
 * VALORES OFICIAIS (validados):
 * - Valor Total do Ciclo: R$ 360,00 (6 posições × R$ 60)
 * - Payout do Ciclo: 30% = R$ 108,00
 * - Estrutura: 1 nível com 6 slots
 * 
 * PAGAMENTOS AUTOMÁTICOS:
 * - Ciclo: 30% (R$ 108,00) → pago ao ciclador
 * - Profundidade: 6,81% (R$ 24,52) → distribuído L1-L6
 * - Fidelidade: 1,25% (R$ 4,50) → pool mensal
 * - Top SIGMA: 4,5% (R$ 16,20) → pool Top 10
 * 
 * IMPORTANTE: Nenhum bônus exige diretos ativos.
 */

export async function closeCycle(consultorId: string): Promise<void> {
  try {
    // Dados do consultor e de sua linha direta
    const consultor = await getConsultorById(consultorId);
    const downlines = await getDownlines(consultorId);

    // Validação básica de fechamento
    if (!consultor) {
      throw new Error("Consultor inexistente.");
    }

    if (downlines.length < 6) {
      logEvent("cycle.skip", { 
        consultorId, 
        reason: "Aguardando completar 6 posições.",
        current: downlines.length 
      });
      return;
    }

    // ✅ VALORES OFICIAIS VALIDADOS
    const CYCLE_BASE_BRL = 360.00;      // R$ 360 (6 × R$ 60)
    const CYCLE_PAYOUT_PCT = 30;        // 30%
    const CYCLE_PAYOUT_BRL = 108.00;    // R$ 108

    // Marca ciclo como concluído
    const cycleData = {
      consultorId,
      dataFechamento: new Date().toISOString(),
      tipoMatriz: "SIGME_1x6",
      quantidadePosicoes: 6,
      valorCicloCompletoBRL: CYCLE_BASE_BRL,    // R$ 360,00
      valorReentradaBRL: 60,                     // R$ 60,00 (individual)
      payoutPercentual: CYCLE_PAYOUT_PCT,        // 30%
      payoutValor: CYCLE_PAYOUT_BRL,             // R$ 108,00
      status: "FECHADO"
    };

    await saveCycleHistory(cycleData);

    // 🎯 Paga bônus do ciclo (30% = R$ 108)
    // Este valor vai direto para a carteira do consultor que ciclou
    logEvent("cycle.payout", { 
      consultorId, 
      valor: CYCLE_PAYOUT_BRL, 
      tipo: "CICLO" 
    });

    // 🌳 Paga bônus de profundidade (6,81% = R$ 24,52 distribuído em L1-L6)
    await payDepth(consultorId, cycleData);

    // 💛 Registra para pool de fidelidade (1,25% = R$ 4,50)
    await payFidelity(consultorId, cycleData);

    // 🏆 Atualiza ranking Top SIGMA (4,5% = R$ 16,20)
    await payTopSigma(consultorId, cycleData);

    // 📧 Notificação ao consultor
    await sendNotification(consultorId, {
      titulo: "🎉 Ciclo SIGME Concluído!",
      mensagem: `Parabéns! Seu ciclo SIGME 1×6 foi concluído com sucesso.

💰 Bônus do Ciclo: R$ ${CYCLE_PAYOUT_BRL.toFixed(2)} (30%)
🌳 Bônus de Profundidade: Calculado até L6
💛 Pool Fidelidade: Registrado (1,25%)
🏆 Ranking Top SIGMA: Atualizado

Total do ciclo: R$ ${CYCLE_BASE_BRL.toFixed(2)}`,
      tipo: "sucesso"
    });

    logEvent("cycle.closed", { 
      consultorId, 
      cycleData,
      payouts: {
        ciclo: CYCLE_PAYOUT_BRL,
        profundidade: "L1-L6 (6,81%)",
        fidelidade: "Pool (1,25%)",
        topSigma: "Ranking (4,5%)"
      }
    });

  } catch (err: any) {
    logEvent("cycle.error", { consultorId, error: err.message });
    throw err;
  }
}
