/**
 * RS PRÓLIPSI - CRON DE FECHAMENTO DE CICLOS
 * Executa fechamentos automáticos de períodos
 */

import cron from 'node-cron';
import moment from 'moment-timezone';
import cyclesConfig from '../../../rs-config/src/settings/cycles.json';

// ================================================
// CONFIGURAÇÕES
// ================================================

const TIMEZONE = cyclesConfig.timing.timezone;
const CLOSURE_TIME = cyclesConfig.automation.closureTime;

// ================================================
// HELPERS - DATA E PERÍODO
// ================================================

/**
 * Retorna data atual no timezone do Brasil
 */
function getBrazilDate(): Date {
  return moment.tz(TIMEZONE).toDate();
}

/**
 * Verifica se hoje é fim de mês
 */
function isMonthEnd(date: Date = getBrazilDate()): boolean {
  const m = moment(date).tz(TIMEZONE);
  const lastDay = m.clone().endOf('month').date();
  return m.date() === lastDay;
}

/**
 * Verifica se hoje é fim de trimestre
 */
function isQuarterEnd(date: Date = getBrazilDate()): boolean {
  const m = moment(date).tz(TIMEZONE);
  const month = m.format('MMM');
  
  const quarterEndMonths = cyclesConfig.career.quarters
    .map(q => q.closeMonth);
  
  return quarterEndMonths.includes(month) && isMonthEnd(date);
}

/**
 * Retorna o trimestre atual
 */
function getCurrentQuarter(): any {
  const m = moment().tz(TIMEZONE);
  const month = m.format('MMM');
  
  return cyclesConfig.career.quarters.find(q => 
    q.months.includes(month)
  );
}

/**
 * Verifica se é dia de fechamento mensal
 */
function isMonthlyCloseDay(): boolean {
  const today = moment().tz(TIMEZONE).date();
  const closeDay = cyclesConfig.bonuses.fidelity.closeDay;
  
  // Se closeDay é 30 mas mês tem 31, fecha no 30
  // Se closeDay é 30 mas mês tem 28/29, fecha no último dia
  const lastDay = moment().tz(TIMEZONE).endOf('month').date();
  
  if (closeDay >= lastDay) {
    return today === lastDay;
  }
  
  return today === closeDay;
}

// ================================================
// FECHAMENTO MENSAL - POOLS
// ================================================

/**
 * Fecha o pool de fidelidade mensal
 */
async function closeFidelityPool(): Promise<void> {
  console.log('💛 Fechando Pool de Fidelidade...');
  
  try {
    const period = moment().tz(TIMEZONE).format('YYYY-MM');
    
    // 1. Buscar todos os ciclos do mês
    const totalCycles = await getTotalCyclesForPeriod(period);
    
    // 2. Calcular valor total do pool (1.25% de todos os ciclos)
    const poolTotal = totalCycles * 360 * 0.0125; // R$ 4.50 por ciclo
    
    // 3. Buscar consultores elegíveis
    const eligibleConsultores = await getEligibleConsultores(period);
    
    // 4. Distribuir proporcionalmente
    const distributions = calculateFidelityDistribution(
      eligibleConsultores,
      poolTotal
    );
    
    // 5. Creditar nas carteiras
    for (const dist of distributions) {
      await creditWallet(dist.consultorId, dist.amount, 'fidelity', period);
      await registerBonus({
        consultorId: dist.consultorId,
        tipo: 'fidelity',
        periodo: period,
        valor: dist.amount,
        ciclos: dist.cycles
      });
    }
    
    // 6. Gerar relatório
    await generateFidelityReport(period, {
      totalCycles,
      poolTotal,
      distributions,
      eligibleCount: eligibleConsultores.length
    });
    
    console.log(`✅ Pool Fidelidade fechado: R$ ${poolTotal.toFixed(2)}`);
    
  } catch (error: any) {
    console.error('❌ Erro ao fechar Pool Fidelidade:', error.message);
    await notifyError('Fidelity Pool Closure', error);
    throw error;
  }
}

/**
 * Fecha o pool Top SIGMA mensal
 */
async function closeTopSigmaPool(): Promise<void> {
  console.log('🏆 Fechando Pool Top SIGMA...');
  
  try {
    const period = moment().tz(TIMEZONE).format('YYYY-MM');
    
    // 1. Buscar todos os ciclos do mês
    const totalCycles = await getTotalCyclesForPeriod(period);
    
    // 2. Calcular valor total do pool (4.5%)
    const poolTotal = totalCycles * 360 * 0.045; // R$ 16.20 por ciclo
    
    // 3. Gerar ranking Top 10
    const ranking = await generateTopSigmaRanking(period);
    
    // 4. Distribuir conforme percentuais
    const distributions = calculateTopSigmaDistribution(ranking, poolTotal);
    
    // 5. Creditar nas carteiras
    for (const dist of distributions) {
      await creditWallet(dist.consultorId, dist.amount, 'top_sigma', period);
      await registerBonus({
        consultorId: dist.consultorId,
        tipo: 'top_sigma',
        subtipo: `Posição ${dist.position}`,
        periodo: period,
        valor: dist.amount,
        ciclos: dist.cycles
      });
    }
    
    // 6. Gerar relatório
    await generateTopSigmaReport(period, {
      totalCycles,
      poolTotal,
      ranking,
      distributions
    });
    
    console.log(`✅ Pool Top SIGMA fechado: R$ ${poolTotal.toFixed(2)}`);
    
  } catch (error: any) {
    console.error('❌ Erro ao fechar Pool Top SIGMA:', error.message);
    await notifyError('Top SIGMA Pool Closure', error);
    throw error;
  }
}

/**
 * Fecha ambos os pools mensais
 */
async function closeMonthlyBonuses(): Promise<void> {
  console.log('📅 FECHAMENTO MENSAL INICIADO');
  console.log(`Data: ${moment().tz(TIMEZONE).format('DD/MM/YYYY HH:mm')}`);
  
  try {
    // Notificar início
    await notifyClosureStart('monthly');
    
    // Fechar pools
    await closeFidelityPool();
    await closeTopSigmaPool();
    
    // Gerar relatório consolidado
    await generateMonthlyReport();
    
    // Notificar conclusão
    await notifyClosureComplete('monthly');
    
    console.log('✅ FECHAMENTO MENSAL CONCLUÍDO');
    
  } catch (error: any) {
    console.error('❌ ERRO NO FECHAMENTO MENSAL:', error.message);
    await notifyError('Monthly Closure', error);
  }
}

// ================================================
// FECHAMENTO TRIMESTRAL - CARREIRA
// ================================================

/**
 * Fecha o trimestre de carreira
 */
async function closeCareerQuarter(): Promise<void> {
  console.log('🎯 Fechando Trimestre de Carreira...');
  
  try {
    const quarter = getCurrentQuarter();
    const period = `${quarter.name}-${moment().tz(TIMEZONE).year()}`;
    
    console.log(`Trimestre: ${quarter.name} (${quarter.months.join(', ')})`);
    
    // 1. Buscar todos os consultores
    const consultores = await getAllConsultores();
    
    // 2. Calcular pontos de carreira (com VMEC)
    const careerData = [];
    
    for (const consultor of consultores) {
      const points = await calculateCareerPoints(consultor.id, quarter);
      
      careerData.push({
        consultorId: consultor.id,
        nome: consultor.nome,
        pinAtual: consultor.pin_atual,
        pontosAnteriores: consultor.pontos_carreira,
        pontosNovos: points.ciclos_validos_vmec,
        pontosTotal: consultor.pontos_carreira + points.ciclos_validos_vmec,
        linhasAtivas: points.linhas_ativas,
        ciclosTotais: points.ciclos_totais
      });
    }
    
    // 3. Verificar upgrades de PIN
    const upgrades = [];
    
    for (const data of careerData) {
      const upgrade = await checkPinUpgrade(data);
      
      if (upgrade.shouldUpgrade) {
        await upgradePinLevel(data.consultorId, upgrade.newPin);
        await creditUpgradeReward(data.consultorId, upgrade.reward);
        
        upgrades.push({
          consultorId: data.consultorId,
          nome: data.nome,
          pinAnterior: data.pinAtual,
          pinNovo: upgrade.newPin,
          recompensa: upgrade.reward
        });
        
        // Notificar consultor
        await notifyPinUpgrade(data.consultorId, upgrade);
      }
    }
    
    // 4. Atualizar pontos de carreira
    for (const data of careerData) {
      await updateCareerPoints(data.consultorId, data.pontosTotal);
    }
    
    // 5. Gerar relatório trimestral
    await generateQuarterlyReport(period, {
      quarter,
      careerData,
      upgrades,
      totalConsultores: consultores.length,
      totalUpgrades: upgrades.length
    });
    
    console.log(`✅ Trimestre ${quarter.name} fechado`);
    console.log(`   Consultores avaliados: ${consultores.length}`);
    console.log(`   Upgrades de PIN: ${upgrades.length}`);
    
  } catch (error: any) {
    console.error('❌ Erro ao fechar trimestre:', error.message);
    await notifyError('Quarterly Closure', error);
    throw error;
  }
}

// ================================================
// CRON JOBS
// ================================================

/**
 * CRON Principal - Executa diariamente às 03:00
 * Verifica se é dia de fechamento e executa
 */
export function startClosureCron(): void {
  console.log('🕐 Iniciando CRON de Fechamento de Ciclos...');
  console.log(`   Horário: ${CLOSURE_TIME} (${TIMEZONE})`);
  
  // Executa todos os dias às 03:00
  cron.schedule(`0 3 * * *`, async () => {
    console.log('\n================================================');
    console.log('🔍 Verificando fechamentos pendentes...');
    console.log(`Data: ${moment().tz(TIMEZONE).format('DD/MM/YYYY HH:mm')}`);
    
    try {
      // Verificar fechamento trimestral (prioridade)
      if (isQuarterEnd()) {
        console.log('📊 Fim de trimestre detectado!');
        await closeCareerQuarter();
      }
      
      // Verificar fechamento mensal
      if (isMonthlyCloseDay()) {
        console.log('📅 Dia de fechamento mensal!');
        await closeMonthlyBonuses();
      }
      
      console.log('✅ Verificação concluída');
      
    } catch (error: any) {
      console.error('❌ Erro na verificação:', error.message);
    }
    
    console.log('================================================\n');
  }, {
    timezone: TIMEZONE
  });
  
  console.log('✅ CRON de Fechamento ativo');
}

/**
 * CRON de Notificações - Avisa antes do fechamento
 */
export function startReminderCron(): void {
  console.log('🔔 Iniciando CRON de Lembretes...');
  
  // Executa todos os dias às 09:00
  cron.schedule('0 9 * * *', async () => {
    const today = moment().tz(TIMEZONE);
    const daysUntilMonthEnd = today.clone().endOf('month').diff(today, 'days');
    
    // Notificar 7, 3 e 1 dia antes
    if ([7, 3, 1].includes(daysUntilMonthEnd)) {
      await notifyClosureReminder('monthly', daysUntilMonthEnd);
    }
    
    // Verificar trimestre
    const quarter = getCurrentQuarter();
    const quarterEnd = moment(quarter.endDate);
    const daysUntilQuarterEnd = quarterEnd.diff(today, 'days');
    
    if ([7, 3, 1].includes(daysUntilQuarterEnd)) {
      await notifyClosureReminder('quarterly', daysUntilQuarterEnd);
    }
  }, {
    timezone: TIMEZONE
  });
  
  console.log('✅ CRON de Lembretes ativo');
}

// ================================================
// HELPERS - SUPABASE (Placeholders)
// ================================================

async function getTotalCyclesForPeriod(period: string): Promise<number> {
  // TODO: SELECT COUNT(*) FROM matriz_cycles WHERE periodo = period
  console.log(`📊 Buscando ciclos do período ${period}`);
  return 0;
}

async function getEligibleConsultores(period: string): Promise<any[]> {
  // TODO: SELECT consultores elegíveis para fidelidade
  return [];
}

async function calculateFidelityDistribution(consultores: any[], poolTotal: number): Promise<any[]> {
  // TODO: Distribuir proporcionalmente aos ciclos
  return [];
}

async function generateTopSigmaRanking(period: string): Promise<any[]> {
  // TODO: Ranking Top 10 do mês
  return [];
}

async function calculateTopSigmaDistribution(ranking: any[], poolTotal: number): Promise<any[]> {
  // TODO: Distribuir conforme percentuais do config
  return [];
}

async function creditWallet(consultorId: string, amount: number, type: string, period: string): Promise<void> {
  console.log(`💰 Creditar R$ ${amount} para ${consultorId} (${type})`);
}

async function registerBonus(bonus: any): Promise<void> {
  console.log(`📝 Registrar bônus:`, bonus);
}

async function getAllConsultores(): Promise<any[]> {
  // TODO: SELECT * FROM consultores
  return [];
}

async function calculateCareerPoints(consultorId: string, quarter: any): Promise<any> {
  // TODO: Calcular pontos com VMEC
  return { ciclos_totais: 0, ciclos_validos_vmec: 0, linhas_ativas: 0 };
}

async function checkPinUpgrade(data: any): Promise<any> {
  // TODO: Verificar se atingiu próximo PIN
  return { shouldUpgrade: false };
}

async function upgradePinLevel(consultorId: string, newPin: string): Promise<void> {
  console.log(`🎯 Upgrade PIN: ${consultorId} → ${newPin}`);
}

async function creditUpgradeReward(consultorId: string, reward: number): Promise<void> {
  console.log(`🎁 Recompensa upgrade: R$ ${reward}`);
}

async function updateCareerPoints(consultorId: string, points: number): Promise<void> {
  console.log(`📊 Atualizar pontos: ${consultorId} = ${points}`);
}

async function generateFidelityReport(period: string, data: any): Promise<void> {
  console.log(`📄 Relatório Fidelidade ${period} gerado`);
}

async function generateTopSigmaReport(period: string, data: any): Promise<void> {
  console.log(`📄 Relatório Top SIGMA ${period} gerado`);
}

async function generateMonthlyReport(): Promise<void> {
  console.log(`📄 Relatório Mensal gerado`);
}

async function generateQuarterlyReport(period: string, data: any): Promise<void> {
  console.log(`📄 Relatório Trimestral ${period} gerado`);
}

async function notifyClosureStart(type: string): Promise<void> {
  console.log(`🔔 Notificar início de fechamento ${type}`);
}

async function notifyClosureComplete(type: string): Promise<void> {
  console.log(`🔔 Notificar conclusão de fechamento ${type}`);
}

async function notifyClosureReminder(type: string, daysLeft: number): Promise<void> {
  console.log(`🔔 Lembrete: Fechamento ${type} em ${daysLeft} dias`);
}

async function notifyPinUpgrade(consultorId: string, upgrade: any): Promise<void> {
  console.log(`🔔 Notificar upgrade PIN: ${consultorId}`);
}

async function notifyError(context: string, error: Error): Promise<void> {
  console.error(`🚨 Erro em ${context}:`, error.message);
}

// ================================================
// EXPORTS
// ================================================

export default {
  startClosureCron,
  startReminderCron,
  closeMonthlyBonuses,
  closeCareerQuarter,
  isMonthEnd,
  isQuarterEnd,
  getBrazilDate
};
