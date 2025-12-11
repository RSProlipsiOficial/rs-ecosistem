/**
 * RS PRÓLIPSI - FECHAMENTO MENSAL TOP SIGMA
 * Fecha o pool mensal de 4,5% e distribui por 10 níveis
 */

import cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';
import topSigmaConfig from '../../../../packages/rs-config/src/settings/topSigma.json';
import moment from 'moment-timezone';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const TZ = 'America/Sao_Paulo';

/**
 * Fecha o pool TOP SIGMA do mês
 */
export async function closeMonthlyTopSigma(period?: string) {
  const targetPeriod = period || moment().tz(TZ).subtract(1, 'month').format('YYYY-MM');
  
  console.log(`[TOP SIGMA] Fechando pool do período: ${targetPeriod}`);
  
  try {
    // 1. Verificar se já foi fechado
    const { data: existing } = await supabase
      .from('top_sigma_snapshots')
      .select('id')
      .eq('period', targetPeriod)
      .single();
    
    if (existing) {
      console.log(`[TOP SIGMA] Período ${targetPeriod} já foi fechado`);
      return;
    }
    
    // 2. Buscar ciclos do mês
    const { data: cycles, error: cyclesError } = await supabase
      .from('cycles_ledger')
      .select('*')
      .eq('period_month', targetPeriod);
    
    if (cyclesError) throw cyclesError;
    
    if (!cycles || cycles.length === 0) {
      console.log(`[TOP SIGMA] Nenhum ciclo encontrado para ${targetPeriod}`);
      return;
    }
    
    console.log(`[TOP SIGMA] Total de ciclos: ${cycles.length}`);
    
    // 3. Calcular base do pool
    const poolBase = cycles.reduce((sum, c) => sum + parseFloat(c.cycle_value), 0);
    const poolAmount = poolBase * topSigmaConfig.payout.poolPct;
    
    console.log(`[TOP SIGMA] Pool base: R$ ${poolBase.toFixed(2)}`);
    console.log(`[TOP SIGMA] Pool amount (4.5%): R$ ${poolAmount.toFixed(2)}`);
    
    // 4. Agrupar ciclos por nível
    const cyclesByLevel: Record<number, any[]> = {};
    for (let i = 1; i <= 10; i++) {
      cyclesByLevel[i] = cycles.filter(c => c.team_level === i);
    }
    
    // 5. Calcular distribuição por nível
    const levelBreakdown: any[] = [];
    const payouts: any[] = [];
    
    for (let level = 1; level <= 10; level++) {
      const levelCycles = cyclesByLevel[level];
      const levelWeight = topSigmaConfig.levelWeights.weights[level - 1];
      const levelPoolAmount = poolAmount * levelWeight;
      const totalCyclesLevel = levelCycles.length;
      
      console.log(`[TOP SIGMA] L${level}: ${totalCyclesLevel} ciclos, peso ${(levelWeight * 100).toFixed(1)}%, pool R$ ${levelPoolAmount.toFixed(2)}`);
      
      levelBreakdown.push({
        level,
        weight: levelWeight,
        cycles: totalCyclesLevel,
        pool_amount: levelPoolAmount,
        consultores: new Set(levelCycles.map(c => c.user_id)).size
      });
      
      if (totalCyclesLevel === 0) continue;
      
      // 6. Distribuir proporcionalmente aos consultores
      const userCyclesAtLevel: Record<string, number> = {};
      levelCycles.forEach(c => {
        userCyclesAtLevel[c.user_id] = (userCyclesAtLevel[c.user_id] || 0) + 1;
      });
      
      for (const [userId, userCycles] of Object.entries(userCyclesAtLevel)) {
        const grossShare = (userCycles / totalCyclesLevel) * levelPoolAmount;
        const finalShare = Math.floor(grossShare * 100) / 100; // floor centavo
        
        payouts.push({
          period: targetPeriod,
          user_id: userId,
          level,
          level_label: `L${level}`,
          user_cycles_at_level: userCycles,
          level_total_cycles: totalCyclesLevel,
          level_pool_amount: levelPoolAmount,
          gross_share: grossShare,
          rounding_mode: 'floor_centavo',
          final_share: finalShare,
          status: 'pending_settlement'
        });
      }
    }
    
    // 7. Calcular total distribuído e resto
    const totalDistributed = payouts.reduce((sum, p) => sum + p.final_share, 0);
    const remainder = poolAmount - totalDistributed;
    
    console.log(`[TOP SIGMA] Total distribuído: R$ ${totalDistributed.toFixed(2)}`);
    console.log(`[TOP SIGMA] Resto: R$ ${remainder.toFixed(2)}`);
    
    // 8. Criar snapshot
    const { error: snapshotError } = await supabase
      .from('top_sigma_snapshots')
      .insert({
        period: targetPeriod,
        pool_base: poolBase,
        pool_amount: poolAmount,
        pool_pct: topSigmaConfig.payout.poolPct,
        level_weights: topSigmaConfig.levelWeights.weights,
        level_breakdown: levelBreakdown,
        total_cycles: cycles.length,
        total_consultores: new Set(cycles.map(c => c.user_id)).size,
        total_distributed: totalDistributed,
        remainder,
        closed_at: new Date()
      });
    
    if (snapshotError) throw snapshotError;
    
    // 9. Inserir payouts
    const { error: payoutsError } = await supabase
      .from('top_sigma_payouts')
      .insert(payouts);
    
    if (payoutsError) throw payoutsError;
    
    console.log(`[TOP SIGMA] ✅ Fechamento concluído!`);
    console.log(`[TOP SIGMA] Total de payouts: ${payouts.length}`);
    
    // 10. TODO: Enfileirar pagamentos na WalletPay
    
    // 11. TODO: Enviar notificações
    
  } catch (error) {
    console.error(`[TOP SIGMA] ❌ Erro:`, error);
    throw error;
  }
}

/**
 * CRON: Executa todo dia 30 às 23:00 (BRT)
 */
export function scheduleMonthlyTopSigma() {
  // Todo dia 30 às 23:00
  cron.schedule('0 23 30 * *', async () => {
    console.log('[CRON] Executando fechamento mensal TOP SIGMA...');
    await closeMonthlyTopSigma();
  }, {
    timezone: TZ
  });
  
  console.log('[CRON] TOP SIGMA agendado: dia 30 às 23:00 BRT');
}

// Exportar para execução manual
export default {
  closeMonthlyTopSigma,
  scheduleMonthlyTopSigma
};
