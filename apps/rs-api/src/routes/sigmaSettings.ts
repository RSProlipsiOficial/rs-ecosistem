import { Router } from 'express'
import { auth } from '../middlewares/auth'
import { getSigmaConfig, updateSigmaSettings, SigmaConfig } from '../services/sigmaConfigService'

const router = Router()

router.get('/consultor/sigma/config', async (_req, res) => {
  try {
    const cfg = await getSigmaConfig()
    res.json({ success: true, config: cfg })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.put('/admin/sigma/settings', auth(true), async (req, res) => {
  try {
    const payload = req.body as SigmaConfig
    await updateSigmaSettings(payload)
    const cfg = await getSigmaConfig()
    res.json({ success: true, config: cfg })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/admin/debug/sigma/config-raw', auth(false), async (_req, res) => {
  try {
    const { data: settings } = await getTable('sigma_settings')
    const { data: depth } = await getTable('sigma_depth_levels')
    const { data: fidelity } = await getTable('sigma_fidelity_levels')
    const { data: top } = await getTable('sigma_top10_levels')
    const { data: pins } = await getTable('sigma_career_pins')
    const sumDepth = (depth || []).reduce((a: number, b: any) => a + Number(b.percent || 0), 0)
    const sumFid = (fidelity || []).reduce((a: number, b: any) => a + Number(b.percent || 0), 0)
    const sumTop = (top || []).reduce((a: number, b: any) => a + Number(b.percent_of_pool || 0), 0)
    const pinsCount = (pins || []).length
    console.log('sigma_settings:', settings?.length || 0)
    console.log('sigma_depth_levels:', depth?.length || 0, 'total %', sumDepth)
    console.log('sigma_fidelity_levels:', fidelity?.length || 0, 'total %', sumFid)
    console.log('sigma_top10_levels:', top?.length || 0, 'total %', sumTop)
    console.log('sigma_career_pins:', pinsCount)
    res.json({ success: true, raw: { settings, depth, fidelity, top, pins }, summary: { settings: settings?.length || 0, depth_levels: depth?.length || 0, fidelity_levels: fidelity?.length || 0, top10_levels: top?.length || 0, pins: pinsCount, totals: { depth_percent: sumDepth, fidelity_percent: sumFid, top_percent: sumTop } } })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

async function getTable(name: string) {
  const { supabase } = require('../lib/supabaseClient')
  return await supabase.from(name).select('*')
}

export default router
