/**
 * Sistema de Log para RS Prólipsi OPS
 * Registra todas as operações para auditoria
 */

export interface LogEvent {
  timestamp: string;
  type: string;
  data: any;
  consultorId?: string;
}

const logs: LogEvent[] = [];

export function logEvent(type: string, data: any): void {
  const event: LogEvent = {
    timestamp: new Date().toISOString(),
    type,
    data,
    consultorId: data.consultorId || null,
  };

  logs.push(event);
  
  // Console para desenvolvimento
  console.log(`[${event.timestamp}] ${type}:`, data);

  // TODO: Persistir no Supabase para auditoria
  // TODO: Enviar para rs-docs se for evento crítico
}

export function getRecentLogs(limit: number = 100): LogEvent[] {
  return logs.slice(-limit);
}

export function getLogsByConsultor(consultorId: string): LogEvent[] {
  return logs.filter(log => log.consultorId === consultorId);
}

export function clearLogs(): void {
  logs.length = 0;
  console.log("Logs limpos");
}
