/**
 * Serviço de notificações
 * Envia notificações para consultores
 */

import { logEvent } from '../utils/log';

export interface Notification {
  titulo: string;
  mensagem: string;
  tipo: 'sucesso' | 'info' | 'alerta' | 'erro';
  metadata?: any;
}

/**
 * Envia notificação para consultor
 */
export async function sendNotification(
  consultorId: string,
  notification: Notification
): Promise<void> {
  try {
    logEvent("notification.send", {
      consultorId,
      tipo: notification.tipo,
      titulo: notification.titulo,
    });

    // TODO: Integrar com sistema de notificações real
    // Opções:
    // - Email (SendGrid, AWS SES)
    // - SMS (Twilio)
    // - Push (Firebase)
    // - WhatsApp (Twilio/Meta)
    // - Notificação in-app (Supabase Realtime)

    console.log(`📧 Notificação para ${consultorId}:`);
    console.log(`   ${notification.tipo.toUpperCase()}: ${notification.titulo}`);
    console.log(`   ${notification.mensagem}`);

    logEvent("notification.success", { consultorId });

  } catch (error: any) {
    logEvent("notification.error", {
      consultorId,
      error: error.message,
    });
    // Não lança erro - notificação não deve parar o fluxo
    console.error(`Erro ao enviar notificação: ${error.message}`);
  }
}

/**
 * Envia notificação em massa
 */
export async function sendBulkNotification(
  consultorIds: string[],
  notification: Notification
): Promise<void> {
  logEvent("notification.bulk.start", { count: consultorIds.length });

  for (const consultorId of consultorIds) {
    await sendNotification(consultorId, notification);
  }

  logEvent("notification.bulk.complete", { count: consultorIds.length });
}
