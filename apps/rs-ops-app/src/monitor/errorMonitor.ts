/**
 * Monitor de Erros e Exceções
 * RS Prólipsi - Error Monitoring System
 * 
 * Monitora, loga e notifica sobre erros do sistema
 */

import { createClient } from '@supabase/supabase-js';

interface ErrorLog {
  id?: string;
  error_type: string;
  error_message: string;
  stack_trace?: string;
  module: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  metadata?: any;
  resolved: boolean;
  created_at?: Date;
}

interface MonitorConfig {
  enableNotifications: boolean;
  criticalAlertChannels: string[];
  logRetentionDays: number;
  maxErrorsPerMinute: number;
}

/**
 * Monitor de Erros
 */
export class ErrorMonitor {
  private supabase: any;
  private config: MonitorConfig;
  private errorCount: Map<string, number> = new Map();

  constructor(supabaseUrl: string, supabaseKey: string, config?: Partial<MonitorConfig>) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.config = {
      enableNotifications: true,
      criticalAlertChannels: ['email', 'discord'],
      logRetentionDays: 90,
      maxErrorsPerMinute: 100,
      ...config
    };
  }

  /**
   * Captura e loga erro
   */
  public async captureError(error: Error | any, context: {
    module: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    user_id?: string;
    metadata?: any;
  }): Promise<void> {
    try {
      const errorLog: ErrorLog = {
        error_type: error.name || 'UnknownError',
        error_message: error.message || String(error),
        stack_trace: error.stack,
        module: context.module,
        severity: context.severity || 'medium',
        user_id: context.user_id,
        metadata: context.metadata,
        resolved: false
      };

      // Salvar no banco
      await this.saveErrorLog(errorLog);

      // Verificar rate limit
      if (this.isRateLimitExceeded(context.module)) {
        await this.handleRateLimitExceeded(context.module);
      }

      // Notificar se crítico
      if (errorLog.severity === 'critical' || errorLog.severity === 'high') {
        await this.sendAlert(errorLog);
      }

    } catch (logError) {
      console.error('Erro ao logar erro:', logError);
    }
  }

  /**
   * Salva log de erro
   */
  private async saveErrorLog(errorLog: ErrorLog): Promise<void> {
    await this.supabase
      .from('error_logs')
      .insert(errorLog);
  }

  /**
   * Verifica rate limit
   */
  private isRateLimitExceeded(module: string): boolean {
    const key = `${module}_${Date.now()}`;
    const count = this.errorCount.get(module) || 0;
    
    this.errorCount.set(module, count + 1);

    // Limpar contador após 1 minuto
    setTimeout(() => {
      this.errorCount.delete(module);
    }, 60000);

    return count >= this.config.maxErrorsPerMinute;
  }

  /**
   * Trata excesso de erros
   */
  private async handleRateLimitExceeded(module: string): Promise<void> {
    const alert: ErrorLog = {
      error_type: 'RateLimitExceeded',
      error_message: `Módulo ${module} excedeu limite de ${this.config.maxErrorsPerMinute} erros/minuto`,
      module: 'ErrorMonitor',
      severity: 'critical',
      resolved: false
    };

    await this.saveErrorLog(alert);
    await this.sendAlert(alert);
  }

  /**
   * Envia alerta
   */
  private async sendAlert(errorLog: ErrorLog): Promise<void> {
    if (!this.config.enableNotifications) return;

    for (const channel of this.config.criticalAlertChannels) {
      try {
        switch (channel) {
          case 'email':
            await this.sendEmailAlert(errorLog);
            break;
          case 'discord':
            await this.sendDiscordAlert(errorLog);
            break;
          case 'sms':
            await this.sendSMSAlert(errorLog);
            break;
        }
      } catch (error) {
        console.error(`Erro ao enviar alerta via ${channel}:`, error);
      }
    }
  }

  /**
   * Envia alerta por email
   */
  private async sendEmailAlert(errorLog: ErrorLog): Promise<void> {
    // Implementar integração com SendGrid
    console.log('📧 Email alert:', errorLog);
  }

  /**
   * Envia alerta para Discord
   */
  private async sendDiscordAlert(errorLog: ErrorLog): Promise<void> {
    // Implementar webhook Discord
    console.log('💬 Discord alert:', errorLog);
  }

  /**
   * Envia alerta por SMS
   */
  private async sendSMSAlert(errorLog: ErrorLog): Promise<void> {
    // Implementar integração com Twilio
    console.log('📱 SMS alert:', errorLog);
  }

  /**
   * Limpa logs antigos
   */
  public async cleanOldLogs(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.logRetentionDays);

    const { data, error } = await this.supabase
      .from('error_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) throw error;

    return data?.length || 0;
  }

  /**
   * Gera relatório de erros
   */
  public async generateReport(days: number = 7): Promise<string> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: errors } = await this.supabase
      .from('error_logs')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (!errors) return 'Nenhum erro encontrado';

    const byModule = errors.reduce((acc: any, err: ErrorLog) => {
      acc[err.module] = (acc[err.module] || 0) + 1;
      return acc;
    }, {});

    const bySeverity = errors.reduce((acc: any, err: ErrorLog) => {
      acc[err.severity] = (acc[err.severity] || 0) + 1;
      return acc;
    }, {});

    let report = '\n';
    report += '='.repeat(70) + '\n';
    report += `📊 RELATÓRIO DE ERROS - Últimos ${days} dias\n`;
    report += '='.repeat(70) + '\n\n';
    report += `Total de Erros: ${errors.length}\n\n`;
    
    report += 'Por Módulo:\n';
    Object.entries(byModule).forEach(([module, count]) => {
      report += `  ${module}: ${count}\n`;
    });

    report += '\nPor Severidade:\n';
    Object.entries(bySeverity).forEach(([severity, count]) => {
      const icon = severity === 'critical' ? '🔴' : severity === 'high' ? '🟠' : severity === 'medium' ? '🟡' : '🟢';
      report += `  ${icon} ${severity}: ${count}\n`;
    });

    report += '\n' + '='.repeat(70) + '\n';

    return report;
  }
}

export default ErrorMonitor;
