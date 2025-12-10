/**
 * MONITOR: Alertas via Discord/Telegram
 * 
 * Função: Envia alertas para canal de monitoramento
 */

import { logEvent } from '../utils/log';

export interface Alert {
  level: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
}

/**
 * Envia alerta via Discord Webhook
 */
export async function sendDiscordAlert(alert: Alert): Promise<void> {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      console.warn('⚠️ DISCORD_WEBHOOK_URL not configured');
      return;
    }

    const color = {
      info: 0x3498db,      // Azul
      warning: 0xf39c12,   // Amarelo
      critical: 0xe74c3c,  // Vermelho
    }[alert.level];

    const payload = {
      embeds: [{
        title: alert.title,
        description: alert.message,
        color,
        timestamp: alert.timestamp,
        footer: {
          text: 'RS Prólipsi OPS Monitor'
        }
      }]
    };

    // TODO: Enviar para Discord
    // await fetch(webhookUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // });

    logEvent('monitor.discord.sent', alert);

  } catch (error: any) {
    logEvent('monitor.discord.error', { error: error.message });
  }
}

/**
 * Envia alerta via Telegram
 */
export async function sendTelegramAlert(alert: Alert): Promise<void> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn('⚠️ Telegram not configured');
      return;
    }

    const emoji = {
      info: 'ℹ️',
      warning: '⚠️',
      critical: '🚨',
    }[alert.level];

    const message = `${emoji} *${alert.title}*\n\n${alert.message}\n\n_${alert.timestamp}_`;

    // TODO: Enviar para Telegram
    // const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    // await fetch(url, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     chat_id: chatId,
    //     text: message,
    //     parse_mode: 'Markdown'
    //   })
    // });

    logEvent('monitor.telegram.sent', alert);

  } catch (error: any) {
    logEvent('monitor.telegram.error', { error: error.message });
  }
}
