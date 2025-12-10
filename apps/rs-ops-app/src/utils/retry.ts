/**
 * RS PRÓLIPSI - SISTEMA DE RETRY AUTOMÁTICO
 * Retry e fallback para jobs que falharem
 */

interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
  maxDelayMs: number;
  onRetry?: (attempt: number, error: Error) => void;
  onFailure?: (error: Error, attempts: number) => void;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delayMs: 1000, // 1 segundo
  backoffMultiplier: 2, // Dobra a cada tentativa
  maxDelayMs: 30000, // Máximo 30 segundos
};

/**
 * Executa uma função com retry automático
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError: Error;
  let currentDelay = fullConfig.delayMs;

  for (let attempt = 1; attempt <= fullConfig.maxAttempts; attempt++) {
    try {
      const result = await fn();
      
      // Sucesso!
      if (attempt > 1) {
        console.log(`✅ Sucesso na tentativa ${attempt}/${fullConfig.maxAttempts}`);
      }
      
      return result;
      
    } catch (error: any) {
      lastError = error;
      
      console.error(`❌ Falha na tentativa ${attempt}/${fullConfig.maxAttempts}:`, error.message);
      
      // Se ainda tem tentativas, aguarda e tenta novamente
      if (attempt < fullConfig.maxAttempts) {
        console.log(`⏳ Aguardando ${currentDelay}ms antes da próxima tentativa...`);
        
        // Callback opcional
        if (fullConfig.onRetry) {
          fullConfig.onRetry(attempt, error);
        }
        
        await sleep(currentDelay);
        
        // Aumenta o delay com backoff exponencial
        currentDelay = Math.min(
          currentDelay * fullConfig.backoffMultiplier,
          fullConfig.maxDelayMs
        );
      }
    }
  }

  // Todas as tentativas falharam
  console.error(`💥 Falha após ${fullConfig.maxAttempts} tentativas`);
  
  if (fullConfig.onFailure) {
    fullConfig.onFailure(lastError!, fullConfig.maxAttempts);
  }
  
  throw lastError!;
}

/**
 * Retry específico para jobs do rs-ops
 */
export async function retryJob(
  jobName: string,
  fn: () => Promise<void>
): Promise<void> {
  try {
    await withRetry(fn, {
      maxAttempts: 3,
      delayMs: 5000, // 5 segundos
      backoffMultiplier: 2,
      
      onRetry: (attempt, error) => {
        logRetry(jobName, attempt, error);
      },
      
      onFailure: async (error, attempts) => {
        await notifyJobFailure(jobName, error, attempts);
      }
    });
    
  } catch (error: any) {
    console.error(`🚨 Job ${jobName} falhou definitivamente:`, error);
    throw error;
  }
}

/**
 * Log de retry para auditoria
 */
function logRetry(jobName: string, attempt: number, error: Error): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    job: jobName,
    attempt,
    error: error.message,
    stack: error.stack
  };
  
  console.log(`📝 Retry registrado:`, logEntry);
  
  // TODO: Salvar no banco (logs_operations)
}

/**
 * Notifica falha definitiva do job
 */
async function notifyJobFailure(
  jobName: string,
  error: Error,
  attempts: number
): Promise<void> {
  const message = `
🚨 **Falha Crítica no Job**

**Job:** ${jobName}
**Tentativas:** ${attempts}
**Erro:** ${error.message}
**Timestamp:** ${new Date().toISOString()}

O job falhou após ${attempts} tentativas. Intervenção manual necessária.
  `;
  
  console.error(message);
  
  // TODO: Enviar para Discord/Telegram
  // await sendAlertDiscord(message);
}

/**
 * Helper: sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry com circuit breaker
 * Se falhar muitas vezes seguidas, para de tentar por um tempo
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private threshold: number = 5, // Falhas antes de abrir
    private resetTimeMs: number = 60000 // 1 minuto
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Se circuit está aberto, verifica se já pode tentar
    if (this.state === 'open') {
      const timeSinceFailure = Date.now() - this.lastFailureTime;
      
      if (timeSinceFailure < this.resetTimeMs) {
        throw new Error(`Circuit breaker OPEN. Aguarde ${this.resetTimeMs - timeSinceFailure}ms`);
      }
      
      // Tenta em modo half-open
      this.state = 'half-open';
    }
    
    try {
      const result = await fn();
      
      // Sucesso! Reseta o circuit
      if (this.state === 'half-open') {
        console.log('✅ Circuit breaker voltou ao normal');
      }
      
      this.failures = 0;
      this.state = 'closed';
      
      return result;
      
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      // Se atingiu o threshold, abre o circuit
      if (this.failures >= this.threshold) {
        this.state = 'open';
        console.error(`🔴 Circuit breaker ABERTO após ${this.failures} falhas`);
      }
      
      throw error;
    }
  }
  
  getState() {
    return {
      state: this.state,
      failures: this.failures,
      threshold: this.threshold
    };
  }
}

// Export default
export default {
  withRetry,
  retryJob,
  CircuitBreaker
};
