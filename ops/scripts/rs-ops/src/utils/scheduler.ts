/**
 * RS PRÓLIPSI - SCHEDULER INTELIGENTE
 * Executa jobs apenas em janelas de baixa carga
 */

interface ScheduleWindow {
  start: string; // HH:MM
  end: string;   // HH:MM
  daysOfWeek: number[]; // 0=domingo, 6=sábado
  priority: 'high' | 'medium' | 'low';
}

interface JobSchedule {
  name: string;
  fn: () => Promise<void>;
  window: ScheduleWindow;
  enabled: boolean;
}

// Janelas de execução padrão
const DEFAULT_WINDOWS: Record<string, ScheduleWindow> = {
  nighttime: {
    start: '01:00',
    end: '05:00',
    daysOfWeek: [1, 2, 3, 4, 5], // Segunda a sexta
    priority: 'high'
  },
  
  business: {
    start: '09:00',
    end: '18:00',
    daysOfWeek: [1, 2, 3, 4, 5],
    priority: 'medium'
  },
  
  weekend: {
    start: '00:00',
    end: '23:59',
    daysOfWeek: [0, 6], // Domingo e sábado
    priority: 'low'
  },
  
  alltime: {
    start: '00:00',
    end: '23:59',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    priority: 'medium'
  }
};

/**
 * Verifica se está dentro da janela de execução
 */
export function isInWindow(window: ScheduleWindow): boolean {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  // Verifica dia da semana
  if (!window.daysOfWeek.includes(currentDay)) {
    return false;
  }
  
  // Verifica horário
  if (currentTime < window.start || currentTime > window.end) {
    return false;
  }
  
  return true;
}

/**
 * Verifica se é horário noturno (madrugada)
 */
export function isNightTime(): boolean {
  return isInWindow(DEFAULT_WINDOWS.nighttime);
}

/**
 * Verifica se é fim de semana
 */
export function isWeekend(): boolean {
  const now = new Date();
  const day = now.getDay();
  return day === 0 || day === 6; // Domingo ou sábado
}

/**
 * Verifica se é horário de baixa carga
 */
export function isLowLoadTime(): boolean {
  // Madrugada de segunda a sexta
  if (isNightTime() && !isWeekend()) {
    return true;
  }
  
  // Fim de semana completo
  if (isWeekend()) {
    return true;
  }
  
  return false;
}

/**
 * Executa job apenas se estiver na janela correta
 */
export async function runIfInWindow(
  jobName: string,
  fn: () => Promise<void>,
  window: ScheduleWindow = DEFAULT_WINDOWS.nighttime
): Promise<boolean> {
  
  if (!isInWindow(window)) {
    console.log(`⏸️ Job ${jobName} fora da janela de execução`);
    return false;
  }
  
  console.log(`▶️ Executando job ${jobName} (prioridade: ${window.priority})`);
  
  try {
    await fn();
    console.log(`✅ Job ${jobName} completado`);
    return true;
    
  } catch (error: any) {
    console.error(`❌ Job ${jobName} falhou:`, error.message);
    throw error;
  }
}

/**
 * Aguarda até a próxima janela de execução
 */
export async function waitForWindow(window: ScheduleWindow): Promise<void> {
  while (!isInWindow(window)) {
    const waitMinutes = 5;
    console.log(`⏰ Aguardando janela de execução... (verificando em ${waitMinutes}min)`);
    await sleep(waitMinutes * 60 * 1000);
  }
}

/**
 * Scheduler de múltiplos jobs com prioridades
 */
export class JobScheduler {
  private jobs: Map<string, JobSchedule> = new Map();
  private running = false;
  
  /**
   * Registra um job
   */
  register(job: JobSchedule): void {
    this.jobs.set(job.name, job);
    console.log(`📝 Job registrado: ${job.name}`);
  }
  
  /**
   * Remove um job
   */
  unregister(jobName: string): void {
    this.jobs.delete(jobName);
    console.log(`🗑️ Job removido: ${jobName}`);
  }
  
  /**
   * Inicia o scheduler
   */
  start(): void {
    if (this.running) {
      console.warn('⚠️ Scheduler já está rodando');
      return;
    }
    
    this.running = true;
    console.log('🚀 Scheduler iniciado');
    
    this.loop();
  }
  
  /**
   * Para o scheduler
   */
  stop(): void {
    this.running = false;
    console.log('⏹️ Scheduler parado');
  }
  
  /**
   * Loop principal do scheduler
   */
  private async loop(): Promise<void> {
    while (this.running) {
      const now = new Date();
      console.log(`🕐 Verificação: ${now.toLocaleString('pt-BR')}`);
      
      // Ordena jobs por prioridade
      const sortedJobs = Array.from(this.jobs.values()).sort((a, b) => {
        const priorities = { high: 3, medium: 2, low: 1 };
        return priorities[b.window.priority] - priorities[a.window.priority];
      });
      
      // Executa jobs que estão na janela
      for (const job of sortedJobs) {
        if (!job.enabled) continue;
        
        if (isInWindow(job.window)) {
          try {
            console.log(`▶️ Executando: ${job.name} (prioridade: ${job.window.priority})`);
            await job.fn();
            console.log(`✅ Completado: ${job.name}`);
            
          } catch (error: any) {
            console.error(`❌ Erro em ${job.name}:`, error.message);
          }
        }
      }
      
      // Aguarda 5 minutos antes da próxima verificação
      await sleep(5 * 60 * 1000);
    }
  }
  
  /**
   * Status do scheduler
   */
  status(): {
    running: boolean;
    jobs_registered: number;
    jobs_enabled: number;
    current_time: string;
    is_low_load: boolean;
  } {
    const enabledJobs = Array.from(this.jobs.values()).filter(j => j.enabled);
    
    return {
      running: this.running,
      jobs_registered: this.jobs.size,
      jobs_enabled: enabledJobs.length,
      current_time: new Date().toLocaleString('pt-BR'),
      is_low_load: isLowLoadTime()
    };
  }
}

/**
 * Helper: sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Exemplo de uso
 */
export function example() {
  const scheduler = new JobScheduler();
  
  // Job pesado: só madrugada
  scheduler.register({
    name: 'recalc-bonuses',
    fn: async () => {
      console.log('Recalculando bônus...');
      // await recalcBonuses();
    },
    window: DEFAULT_WINDOWS.nighttime,
    enabled: true
  });
  
  // Job leve: horário comercial
  scheduler.register({
    name: 'check-cycles',
    fn: async () => {
      console.log('Verificando ciclos...');
      // await checkPendingCycles();
    },
    window: DEFAULT_WINDOWS.business,
    enabled: true
  });
  
  scheduler.start();
}

// Exports
export default {
  isInWindow,
  isNightTime,
  isWeekend,
  isLowLoadTime,
  runIfInWindow,
  waitForWindow,
  JobScheduler,
  DEFAULT_WINDOWS
};
