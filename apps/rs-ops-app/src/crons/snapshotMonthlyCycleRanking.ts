/**
 * RS PRÓLIPSI - SNAPSHOT MENSAL DE RANKING
 * Tira snapshot do ranking de ciclos do mês
 */

import cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';
import rankingConfig from '../../../../packages/rs-config/src/settings/ranking.json';
import moment from 'moment-timezone';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const TZ = 'America/Sao_Paulo';

/**
 * Cria snapshot do ranking mensal
 */
export async function snapshotMonthlyCycleRanking(period?: string) {
  const targetPeriod = period || moment().tz(TZ).subtract(1, 'month').format('YYYY-MM');
  
  console.log(`[RANKING] Criando snapshot do período: ${targetPeriod}`);
  
  try {
    // 1. Verificar se já existe
    const { data: existing } = await supabase
      .from('cycle_ranking_snapshots')
      .select('id')
      .eq('period', targetPeriod)
      .eq('period_type', 'monthly')
      .limit(1);
    
    if (existing && existing.length > 0) {
      console.log(`[RANKING] Snapshot do período ${targetPeriod} já existe`);
      return;
    }
    
    // 2. Buscar ranking da view
    const { data: ranking, error: rankingError } = await supabase
      .from('vw_ranking_monthly')
      .select('*')
      .eq('period', targetPeriod)
      .order('position', { ascending: true })
      .limit(rankingConfig.display.leaderboardSize);
    
    if (rankingError) throw rankingError;
    
    if (!ranking || ranking.length === 0) {
      console.log(`[RANKING] Nenhum dado de ranking para ${targetPeriod}`);
      return;
    }
    
    console.log(`[RANKING] Total de consultores: ${ranking.length}`);
    
    // 3. Buscar ranking do mês anterior para calcular variação
    const previousPeriod = moment(targetPeriod, 'YYYY-MM')
      .subtract(1, 'month')
      .format('YYYY-MM');
    
    const { data: previousRanking } = await supabase
      .from('cycle_ranking_snapshots')
      .select('user_id, position')
      .eq('period', previousPeriod)
      .eq('period_type', 'monthly');
    
    const previousPositions: Record<string, number> = {};
    if (previousRanking) {
      previousRanking.forEach(r => {
        previousPositions[r.user_id] = r.position;
      });
    }
    
    // 4. Preparar snapshots
    const snapshots = ranking.map(r => {
      const previousPosition = previousPositions[r.user_id] || null;
      const positionChange = previousPosition 
        ? previousPosition - r.position 
        : null;
      
      return {
        period: targetPeriod,
        period_type: 'monthly',
        position: r.position,
        user_id: r.user_id,
        own_cycles: r.own_cycles,
        team_cycles: r.team_cycles,
        total_cycles: r.total_cycles,
        previous_position: previousPosition,
        position_change: positionChange,
        pin_code: r.pin_atual,
        pin_label: r.pin_label,
        snapshot_date: new Date()
      };
    });
    
    // 5. Inserir snapshots
    const { error: insertError } = await supabase
      .from('cycle_ranking_snapshots')
      .insert(snapshots);
    
    if (insertError) throw insertError;
    
    console.log(`[RANKING] ✅ Snapshot criado!`);
    console.log(`[RANKING] Top 3:`);
    snapshots.slice(0, 3).forEach(s => {
      console.log(`  ${s.position}º - User ${s.user_id.substring(0, 8)}... - ${s.total_cycles} ciclos`);
    });
    
    // 6. TODO: Enviar notificações para Top 10
    
  } catch (error) {
    console.error(`[RANKING] ❌ Erro:`, error);
    throw error;
  }
}

/**
 * CRON: Executa todo dia 30 às 22:00 (BRT)
 */
export function scheduleMonthlyCycleRanking() {
  // Todo dia 30 às 22:00 (antes do TOP SIGMA)
  cron.schedule('0 22 30 * *', async () => {
    console.log('[CRON] Executando snapshot mensal de ranking...');
    await snapshotMonthlyCycleRanking();
  }, {
    timezone: TZ
  });
  
  console.log('[CRON] Ranking mensal agendado: dia 30 às 22:00 BRT');
}

// Exportar para execução manual
export default {
  snapshotMonthlyCycleRanking,
  scheduleMonthlyCycleRanking
};
