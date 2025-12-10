import { createClient } from '@supabase/supabase-js'

export type SigmaConfig = {
  cycle: { value: number; payoutValue: number; payoutPercent: number }
  depthBonus: { basePercent: number; baseOverValue: number; levels: { level: number; percent: number }[] }
  fidelityBonus: { percentTotal: number; levels: { level: number; percent: number }[] }
  topSigma: { percentTotal: number; ranks: { rank: number; percent: number }[] }
  career: { percentTotal: number; valuePerCycle: number; pins: { name: string; cyclesRequired: number; minLinesRequired: number; vmecDistribution: string; rewardValue: number; orderIndex: number }[] }
}

function supabaseClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes')
  return createClient(url, key)
}

export async function getSigmaConfigCore(): Promise<SigmaConfig> {
  const sb = supabaseClient()
  const { data: settings } = await sb.from('sigma_settings').select('*').order('updated_at', { ascending: false }).limit(1).maybeSingle()
  const id = settings?.id
  const { data: depth } = await sb.from('sigma_depth_levels').select('*').eq('settings_id', id).order('order_index', { ascending: true })
  const { data: fidelity } = await sb.from('sigma_fidelity_levels').select('*').eq('settings_id', id).order('order_index', { ascending: true })
  const { data: top } = await sb.from('sigma_top10_levels').select('*').eq('settings_id', id).order('order_index', { ascending: true })
  const { data: pins } = await sb.from('sigma_career_pins').select('*').eq('settings_id', id).order('order_index', { ascending: true })
  const cycleValue = Number(settings?.cycle_value ?? 360)
  const payoutPct = Number(settings?.cycle_payout_percent ?? 30)
  const cfg: SigmaConfig = {
    cycle: { value: cycleValue, payoutValue: +(cycleValue * (payoutPct / 100)).toFixed(2), payoutPercent: payoutPct },
    depthBonus: {
      basePercent: (() => {
        const pool = (depth || []).reduce((a, b) => a + Number(b.value_per_cycle || 0), 0)
        return cycleValue ? +(pool / cycleValue * 100).toFixed(5) : 0
      })(),
      baseOverValue: cycleValue,
      levels: (depth || []).map(d => ({ level: Number(d.level), percent: Number(d.percent) }))
    },
    fidelityBonus: {
      percentTotal: Number(settings?.fidelity_source_percent ?? 1.25),
      levels: (fidelity || []).map(f => ({ level: Number(f.level), percent: Number(f.percent) }))
    },
    topSigma: {
      percentTotal: Number(settings?.top_pool_percent ?? 4.5),
      ranks: (top || []).map(t => ({ rank: Number(t.rank), percent: Number(t.percent_of_pool) }))
    },
    career: {
      percentTotal: Number(settings?.career_percent ?? 6.39),
      valuePerCycle: +((cycleValue * (Number(settings?.career_percent ?? 6.39) / 100))).toFixed(2) as unknown as number,
      pins: (pins || []).map(p => ({
        name: String(p.display_name),
        cyclesRequired: Number(p.cycles_required),
        minLinesRequired: Number(p.min_lines),
        vmecDistribution: String(p.vmec_pattern),
        rewardValue: Number(p.reward_value),
        orderIndex: Number(p.order_index)
      }))
    }
  }
  return cfg
}
