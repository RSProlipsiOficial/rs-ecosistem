/**
 * MONITOR: Verificação API
 * 
 * Função: Verifica se a API está respondendo
 */

import { logEvent } from '../utils/log';

export interface APIHealth {
  status: 'online' | 'offline' | 'slow';
  responseTime: number;
  endpoint: string;
  timestamp: string;
}

export async function checkAPI(apiUrl: string = 'http://localhost:8080'): Promise<APIHealth> {
  try {
    const startTime = Date.now();
    
    // TODO: Fazer requisição para /health
    const response = await fetch(`${apiUrl}/health`);
    const responseTime = Date.now() - startTime;

    const status = response.ok 
      ? (responseTime > 1000 ? 'slow' : 'online')
      : 'offline';

    const health: APIHealth = {
      status,
      responseTime,
      endpoint: apiUrl,
      timestamp: new Date().toISOString(),
    };

    logEvent('monitor.api', health);

    if (status !== 'online') {
      console.warn(`⚠️ API Status: ${status} (${responseTime}ms)`);
    }

    return health;

  } catch (error: any) {
    logEvent('monitor.api.error', { error: error.message });
    
    return {
      status: 'offline',
      responseTime: -1,
      endpoint: apiUrl,
      timestamp: new Date().toISOString(),
    };
  }
}
