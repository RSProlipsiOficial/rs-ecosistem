/**
 * Serviço de integração com rs-walletpay
 * Gerencia pagamentos e transferências
 */

import { logEvent } from '../utils/log';
import { updateWallet } from './supabaseService';

export interface PaymentRequest {
  consultorId: string;
  amount: number;
  type: string;
  description: string;
  metadata?: any;
}

/**
 * Processa pagamento para consultor
 */
export async function processPayment(payment: PaymentRequest): Promise<void> {
  try {
    logEvent("payment.processing", payment);

    // Validações
    if (payment.amount <= 0) {
      throw new Error("Valor do pagamento deve ser positivo");
    }

    if (!payment.consultorId) {
      throw new Error("ID do consultor é obrigatório");
    }

    // Atualiza saldo no Supabase
    await updateWallet(payment.consultorId, payment.amount, payment.type);

    // TODO: Integrar com rs-walletpay para transferência real
    // await walletPayAPI.transfer({
    //   to: payment.consultorId,
    //   amount: payment.amount,
    //   description: payment.description
    // });

    logEvent("payment.success", {
      consultorId: payment.consultorId,
      amount: payment.amount,
      type: payment.type,
    });

  } catch (error: any) {
    logEvent("payment.error", {
      consultorId: payment.consultorId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Processa múltiplos pagamentos em lote
 */
export async function processBatchPayments(payments: PaymentRequest[]): Promise<void> {
  logEvent("payment.batch.start", { count: payments.length });

  const results = {
    success: 0,
    failed: 0,
    errors: [] as any[],
  };

  for (const payment of payments) {
    try {
      await processPayment(payment);
      results.success++;
    } catch (error: any) {
      results.failed++;
      results.errors.push({
        consultorId: payment.consultorId,
        error: error.message,
      });
    }
  }

  logEvent("payment.batch.complete", results);

  if (results.failed > 0) {
    console.warn(`${results.failed} pagamentos falharam`, results.errors);
  }
}

/**
 * Consulta saldo de consultor
 */
export async function getBalance(consultorId: string): Promise<number> {
  // TODO: Implementar busca real do saldo
  logEvent("wallet.balance.query", { consultorId });
  return 0;
}
