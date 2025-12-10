import { supabase } from '../lib/supabaseClient'

export type SigmaConfig = {
  cycle: {
    value: number
    payoutValue: number
    payoutPercent: number
    autoReentryEnabled: boolean
    autoReentryLimitPerMonth: number
    spilloverMode: string
  }
  depthBonus: {
    basePercent: number
    baseOverValue: number
    levels: { level: number; percent: number }[]
  }
  fidelityBonus: {
    percentTotal: number
    levels: { level: number; percent: number }[]
  }
  topSigma: {
    percentTotal: number
    ranks: { rank: number; percent: number }[]
  }
  career: {
    percentTotal: number
    valuePerCycle: number
    pins: {
      name: string
      cyclesRequired: number
      minLinesRequired: number
      vmecDistribution: string
      rewardValue: number
      orderIndex: number
      imageUrl?: string
    }[]
  }
}

let cached: SigmaConfig | null = null
let cachedAt = 0

export async function getSigmaConfig(): Promise<SigmaConfig> {
  // Disable cache for now to ensure real-time updates or reduce TTL
  if (cached && Date.now() - cachedAt < 5000) return cached

  const { data: settings } = await supabase.from('sigma_settings').select('*').order('updated_at', { ascending: false }).limit(1).maybeSingle()
  const settingsId = settings?.id

  const { data: depth } = await supabase.from('sigma_depth_levels').select('*').eq('settings_id', settingsId).order('order_index', { ascending: true })
  const { data: fidelity } = await supabase.from('sigma_fidelity_levels').select('*').eq('settings_id', settingsId).order('order_index', { ascending: true })
  const { data: top } = await supabase.from('sigma_top10_levels').select('*').eq('settings_id', settingsId).order('order_index', { ascending: true })

  // Fetch career pins from the new table 'career_levels'
  const { data: careerLevels } = await supabase.from('career_levels').select('*').order('display_order', { ascending: true })

  // Helper to parse bonus string "R$ 1.234,56" to number
  const parseBonus = (val: string) => {
    if (!val) return 0;
    return parseFloat(val.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) || 0;
  };

  const cfg: SigmaConfig = {
    cycle: {
      value: Number(settings?.cycle_value ?? 360),
      payoutValue: Number(settings?.cycle_payout_value ?? 108),
      payoutPercent: Number(settings?.cycle_payout_percent ?? 30),
      autoReentryEnabled: Boolean(settings?.reentry_enabled ?? true),
      autoReentryLimitPerMonth: Number(settings?.reentry_limit_per_month ?? 10),
      spilloverMode: String(settings?.spillover_mode ?? 'linha_ascendente')
    },
    depthBonus: {
      basePercent: (() => {
        const pool = (depth || []).reduce((a, b) => a + Number(b.value_per_cycle || 0), 0)
        const base = Number(settings?.cycle_value ?? 360)
        return base ? (pool / base) * 100 : 0
      })(),
      baseOverValue: Number(settings?.cycle_value ?? 360),
      levels: (depth || []).map(d => ({ level: Number(d.level), percent: Number(d.percent) }))
    },
    fidelityBonus: {
      percentTotal: Number(settings?.fidelity_source_percent ?? 1.25),
      levels: (fidelity || []).map(f => ({ level: Number(f.level), percent: Number(f.percent) }))
    },
    topSigma: {
      percentTotal: Number(settings?.top_pool_percent ?? 4.5),
      ranks: (top || []).map(t => ({ rank: Number(t.rank), percent: Number(t.percent) }))
    },
    career: {
      percentTotal: Number(settings?.career_percent ?? 6.39),
      valuePerCycle: +((Number(settings?.cycle_value ?? 360) * (Number(settings?.career_percent ?? 6.39) / 100))).toFixed(2),
      pins: (careerLevels || []).map((p, idx) => ({
        name: p.name ? String(p.name) : 'PIN',
        cyclesRequired: Number(p.display_order || 0),
        minLinesRequired: Number(p.required_personal_recruits || 0),
        vmecDistribution: p.benefits ? String(p.benefits) : (p.required_team_volume ? String(p.required_team_volume) : '—'),
        rewardValue: Number(p.required_pv || 0) / 100,
        orderIndex: idx + 1,
        imageUrl: p.pin_image || undefined
      }))
    }
  }
  cached = cfg
  cachedAt = Date.now()
  return cfg
}

export async function updateSigmaSettings(payload: SigmaConfig): Promise<void> {
  const { data: current } = await supabase.from('sigma_settings').select('*').order('updated_at', { ascending: false }).limit(1).maybeSingle()
  const base = {
    cycle_value: payload.cycle.value,
    cycle_payout_value: payload.cycle.payoutValue,
    cycle_payout_percent: payload.cycle.payoutPercent,
    reentry_enabled: payload.cycle.autoReentryEnabled,
    reentry_limit_per_month: payload.cycle.autoReentryLimitPerMonth,
    spillover_mode: payload.cycle.spilloverMode,
    fidelity_source_percent: payload.fidelityBonus.percentTotal,
    top_pool_percent: payload.topSigma.percentTotal,
    career_percent: payload.career.percentTotal,
    updated_at: new Date().toISOString()
  }
  let settingsId = current?.id
  if (!settingsId) {
    const ins = await supabase.from('sigma_settings').insert([base]).select('id').single()
    settingsId = ins.data?.id
  } else {
    await supabase.from('sigma_settings').update(base).eq('id', settingsId)
  }
  await supabase.from('sigma_depth_levels').delete().eq('settings_id', settingsId)
  await supabase.from('sigma_fidelity_levels').delete().eq('settings_id', settingsId)
  await supabase.from('sigma_top10_levels').delete().eq('settings_id', settingsId)
  await supabase.from('sigma_career_pins').delete().eq('settings_id', settingsId)
  if (payload.depthBonus.levels?.length) {
    const basePool = (payload.cycle.value * (payload.depthBonus.basePercent / 100))
    await supabase.from('sigma_depth_levels').insert(payload.depthBonus.levels.map((l, idx) => ({ settings_id: settingsId, level: l.level, percent: l.percent, value_per_cycle: basePool * (l.percent / 100), order_index: idx })))
  }
  if (payload.fidelityBonus.levels?.length) {
    const pool = (payload.cycle.value * (payload.fidelityBonus.percentTotal / 100))
    await supabase.from('sigma_fidelity_levels').insert(payload.fidelityBonus.levels.map((l, idx) => ({ settings_id: settingsId, level: l.level, percent: l.percent, value_per_cycle: pool * (l.percent / 100), order_index: idx })))
  }
  if (payload.topSigma.ranks?.length) {
    await supabase.from('sigma_top10_levels').insert(payload.topSigma.ranks.map((r, idx) => ({ settings_id: settingsId, rank: r.rank, percent_of_pool: r.percent, pool_percent_base: payload.topSigma.percentTotal, order_index: idx })))
  }
  if (payload.career.pins?.length) {
    await supabase.from('sigma_career_pins').insert(payload.career.pins.map(p => ({
      settings_id: settingsId,
      name: p.name,
      cycles_required: p.cyclesRequired,
      min_lines_required: p.minLinesRequired,
      vmec_distribution: p.vmecDistribution,
      reward_value: p.rewardValue,
      order_index: p.orderIndex
    })))
  }
  cached = null
  cachedAt = 0
}
