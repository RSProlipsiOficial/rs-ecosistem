/**
 * Reentrada de Ciclo
 * Processa quando consultor faz nova compra de R$ 60 após ciclar
 * 
 * REGRAS:
 * - Valor: R$ 60,00
 * - Limite: 10 reentradas/mês
 * - Desbloqueio: Automático após ciclar
 * - Aciona: Pool de Fidelidade
 */

import { getConsultorById } from '../../services/supabaseService';
import { openCycle } from './openCycle';
import { payFidelity } from '../distribution/payFidelity';
import { logEvent } from '../../utils/log';
import { CONSTANTS } from '../../utils/math';

export interface ReentryRequest {
  consultorId: string;
  valorPago: number;
}

/**
 * Processa reentrada de consultor
 */
export async function reentryCycle(request: ReentryRequest): Promise<void> {
  try {
    logEvent("reentry.start", request);

    // Valida valor
    if (request.valorPago !== CONSTANTS.REENTRY_BRL) {
      throw new Error(
        `Valor de reentrada incorreto. Esperado: R$ ${CONSTANTS.REENTRY_BRL}, Recebido: R$ ${request.valorPago}`
      );
    }

    // Busca consultor
    const consultor = await getConsultorById(request.consultorId);
    if (!consultor) {
      throw new Error("Consultor não encontrado");
    }

    // TODO: Verificar limite de 10 reentradas/mês
    // const reentryCount = await getMonthlyReentryCount(request.consultorId);
    // if (reentryCount >= 10) {
    //   throw new Error("Limite de 10 reentradas/mês atingido");
    // }

    // Abre novo ciclo
    await openCycle({
      consultorId: request.consultorId,
      sponsorId: consultor.sponsor_id,
      valorEntrada: CONSTANTS.REENTRY_BRL,
      tipo: 'REENTRADA',
    });

    // Aciona pool de fidelidade
    const cycleData = {
      id: `reentry-${request.consultorId}-${Date.now()}`,
      consultorId: request.consultorId,
      tipo: 'REENTRADA',
      valorEntradaBRL: CONSTANTS.REENTRY_BRL,
    };

    await payFidelity(request.consultorId, cycleData);

    logEvent("reentry.success", {
      consultorId: request.consultorId,
      valor: request.valorPago,
    });

    console.log(`🔄 Reentrada processada para ${request.consultorId}`);

  } catch (error: any) {
    logEvent("reentry.error", {
      consultorId: request.consultorId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Verifica se consultor pode reentrar
 */
export async function canReentry(consultorId: string): Promise<boolean> {
  try {
    // TODO: Implementar verificações:
    // 1. Consultor ciclou pelo menos uma vez?
    // 2. Não atingiu limite de 10 reentradas/mês?
    // 3. Está ativo?

    return true;

  } catch (error: any) {
    logEvent("reentry.check.error", {
      consultorId,
      error: error.message,
    });
    return false;
  }
}
