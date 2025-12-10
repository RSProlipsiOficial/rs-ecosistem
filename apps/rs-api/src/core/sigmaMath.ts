import { getSigmaConfig } from '../services/sigmaConfigService'

export async function computeCyclePayout() {
  const cfg = await getSigmaConfig()
  return cfg.cycle.payoutValue
}

export async function computeDepthBonuses() {
  const cfg = await getSigmaConfig()
  const base = (cfg.cycle.value * (cfg.depthBonus.basePercent / 100))
  const weights = cfg.depthBonus.levels.map(l => l.percent)
  const sum = weights.reduce((a, b) => a + b, 0)
  return cfg.depthBonus.levels.map((l) => ({
    level: l.level,
    percent: +(cfg.depthBonus.basePercent * (l.percent / sum)).toFixed(5),
    amount: +((base * l.percent) / sum).toFixed(2)
  }))
}

export async function computeFidelityPool() {
  const cfg = await getSigmaConfig()
  return +(cfg.cycle.value * (cfg.fidelityBonus.percentTotal / 100)).toFixed(2)
}

export async function computeTopSigmaPool() {
  const cfg = await getSigmaConfig()
  return +(cfg.cycle.value * (cfg.topSigma.percentTotal / 100)).toFixed(2)
}
