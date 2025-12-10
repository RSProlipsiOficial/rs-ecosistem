/**
 * CRON: Ativação Mensal de Matrizes
 * Executa: Todo dia 1º de cada mês às 00:00
 * 
 * Função: Reativa matrizes e zera contadores mensais
 */

import cron from 'node-cron';
import { logEvent } from '../utils/log';

export function activateMatrizCron() {
  // Executa dia 1º de cada mês às 00:00
  cron.schedule('0 0 1 * *', async () => {
    try {
      logEvent('cron.activateMatriz.start', { 
        date: new Date().toISOString() 
      });

      console.log('🔄 Iniciando ativação mensal de matrizes...');

      // TODO: Implementar lógica
      // 1. Buscar todas as matrizes ativas
      // 2. Resetar contadores mensais
      // 3. Reativar matrizes pausadas
      // 4. Enviar notificações

      logEvent('cron.activateMatriz.complete', { 
        date: new Date().toISOString() 
      });

      console.log('✅ Ativação mensal concluída');

    } catch (error: any) {
      logEvent('cron.activateMatriz.error', { 
        error: error.message 
      });
      console.error('❌ Erro na ativação mensal:', error.message);
    }
  });

  console.log('⏰ Cron de ativação mensal configurado (1º dia às 00:00)');
}
