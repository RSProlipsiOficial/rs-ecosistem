/**
 * CRON: Distribuição Pool Top SIGMA
 * Executa: Todo dia 1º de cada mês às 03:00
 * 
 * Função: Distribui pool Top SIGMA entre os 10 melhores
 */

import cron from 'node-cron';
import { logEvent } from '../utils/log';
import { distributeTopSigmaPool } from '../core/distribution/payTopSigma';
import { CONSTANTS } from '../utils/math';

export function payTopSigmaPoolCron() {
  // Executa dia 1º de cada mês às 03:00
  cron.schedule('0 3 1 * *', async () => {
    try {
      logEvent('cron.topSigmaPool.start', { 
        date: new Date().toISOString() 
      });

      console.log('🏆 Iniciando distribuição do Pool Top SIGMA...');

      // TODO: Calcular pool acumulado do mês
      const monthlyPool = CONSTANTS.TOP_SIGMA_POOL_BRL * 100; // Exemplo: 100 ciclos

      await distributeTopSigmaPool(monthlyPool);

      logEvent('cron.topSigmaPool.complete', { 
        date: new Date().toISOString(),
        totalPool: monthlyPool 
      });

      console.log('✅ Pool Top SIGMA distribuído');

    } catch (error: any) {
      logEvent('cron.topSigmaPool.error', { 
        error: error.message 
      });
      console.error('❌ Erro ao distribuir Top SIGMA:', error.message);
    }
  });

  console.log('⏰ Cron de Pool Top SIGMA configurado (1º dia às 03:00)');
}
