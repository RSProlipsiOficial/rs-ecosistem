/**
 * Abertura de Novo Ciclo
 * Cria nova entrada na matriz quando consultor faz primeira compra ou reentra
 */

import { saveCycleHistory } from '../../services/supabaseService';
import { logEvent } from '../../utils/log';
import { CONSTANTS } from '../../utils/math';

export interface NewCycleData {
  consultorId: string;
  sponsorId?: string;
  valorEntrada: number;
  tipo: 'PRIMEIRA_COMPRA' | 'REENTRADA';
}

/**
 * Abre novo ciclo para consultor
 */
export async function openCycle(data: NewCycleData): Promise<void> {
  try {
    logEvent("cycle.open.start", data);

    // Valida valor de entrada
    const expectedValue = data.tipo === 'REENTRADA' 
      ? CONSTANTS.REENTRY_BRL 
      : CONSTANTS.CYCLE_BASE_BRL;

    if (data.valorEntrada !== expectedValue) {
      throw new Error(
        `Valor de entrada incorreto. Esperado: R$ ${expectedValue}, Recebido: R$ ${data.valorEntrada}`
      );
    }

    // Cria novo ciclo
    const cycleData = {
      consultorId: data.consultorId,
      sponsorId: data.sponsorId,
      dataAbertura: new Date().toISOString(),
      tipoMatriz: 'SIGME_1x6',
      quantidadePosicoes: 0, // Começa vazio
      valorEntradaBRL: data.valorEntrada,
      tipo: data.tipo,
      status: 'ABERTO',
    };

    await saveCycleHistory(cycleData);

    logEvent("cycle.open.success", {
      consultorId: data.consultorId,
      tipo: data.tipo,
      valor: data.valorEntrada,
    });

    console.log(`✅ Novo ciclo aberto para ${data.consultorId} (${data.tipo})`);

  } catch (error: any) {
    logEvent("cycle.open.error", {
      consultorId: data.consultorId,
      error: error.message,
    });
    throw error;
  }
}
