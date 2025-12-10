import { Router, Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const router = Router()
function sb() {
  const url = process.env.SUPABASE_URL as string
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY) as string
  return createClient(url, key)
}

function hasSupabaseEnv() {
  return Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY))
}

const CONFIG_FILE = path.join(process.cwd(), 'public', 'config.json')
function readLocalConfig(): any {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}
function writeLocalConfig(upd: any) {
  const cur = readLocalConfig()
  const next = { ...cur, ...upd }
  fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true })
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(next, null, 2), 'utf-8')
}

router.get('/admin/consultor/search', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim()
    if (!q) return res.json({ success: true, results: [] })
    const supabase = sb()
    const like = `%${q}%`
    const { data } = await supabase
      .from('consultores')
      .select('id, name, cpf_cnpj, email, phone, patrocinador_id')
      .or(`name.ilike.${like},cpf_cnpj.ilike.${like},email.ilike.${like},id.eq.${q},patrocinador_id.eq.${q}`)
    const results = (data || []).map(r => ({
      id: (r as any).id,
      nome: (r as any).name,
      cpfCnpj: (r as any).cpf_cnpj,
      email: (r as any).email,
      whatsapp: (r as any).phone,
      tipo: 'consultor',
      patrocinador_id: (r as any).patrocinador_id
    }))
    res.json({ success: true, results })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/admin/consultor/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id)
    const supabase = sb()
    const { data: c } = await supabase
      .from('consultores')
      .select('id, name, cpf_cnpj, email, phone, birth_date, permissions, address, bank_info, patrocinador_id, status, registration_date')
      .eq('id', id)
      .single()
    res.json({ success: true, consultant: c })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.put('/admin/consultor/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id)
    const payload = req.body || {}
    const supabase = sb()
    const update: any = {
      name: payload.name,
      cpf_cnpj: payload.cpfCnpj,
      email: payload.email,
      phone: payload.whatsapp,
      birth_date: payload.birthDate,
      address: payload.address, // { cep, street, number, complement, neighborhood, city, state }
      bank_info: payload.bankInfo, // { bankName, bankCode, agency, account, accountType, pix }
      status: payload.status
    }
    const { error } = await supabase
      .from('consultores')
      .update(update)
      .eq('id', id)
    if (error) throw error
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/admin/consultor/:id/edit-permissions', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id)
    const supabase = sb()
    const { data } = await supabase
      .from('consultores')
      .select('permissions')
      .eq('id', id)
      .single()
    res.json({ success: true, permissions: (data as any)?.permissions || {} })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.put('/admin/consultor/:id/edit-permissions', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id)
    const supabase = sb()
    const perms = req.body || {}
    const { error } = await supabase
      .from('consultores')
      .update({ permissions: perms })
      .eq('id', id)
    if (error) throw error
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Dashboard config (global)
router.get('/admin/consultor/dashboard-config', async (_req: Request, res: Response) => {
  try {
    let cfg: any
    if (hasSupabaseEnv()) {
      const supabase = sb()
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'consultant_dashboard_config')
        .maybeSingle()
      cfg = (data as any)?.value
    } else {
      cfg = readLocalConfig().consultant_dashboard_config
    }
    cfg = cfg || { widgets: [], layout: {}, personalization: {} }
    res.json({ success: true, config: cfg })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.put('/admin/consultor/dashboard-config', async (req: Request, res: Response) => {
  try {
    const payload = req.body || {}
    if (hasSupabaseEnv()) {
      const supabase = sb()
      const { data } = await supabase
        .from('settings')
        .select('key')
        .eq('key', 'consultant_dashboard_config')
        .maybeSingle()
      if (data) {
        await supabase
          .from('settings')
          .update({ value: payload })
          .eq('key', 'consultant_dashboard_config')
      } else {
        await supabase
          .from('settings')
          .insert({ key: 'consultant_dashboard_config', value: payload })
      }
    } else {
      writeLocalConfig({ consultant_dashboard_config: payload })
    }
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/consultor/dashboard/config', async (_req: Request, res: Response) => {
  try {
    let cfg: any
    if (hasSupabaseEnv()) {
      const supabase = sb()
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'consultant_dashboard_config')
        .maybeSingle()
      cfg = (data as any)?.value
    } else {
      cfg = readLocalConfig().consultant_dashboard_config
    }
    cfg = cfg || { widgets: [], layout: {}, personalization: {} }
    res.json({ success: true, config: cfg })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// New unified v1 endpoints for separated dashboard layouts
router.get('/v1/dashboard-layout/consultant', async (_req: Request, res: Response) => {
  try {
    let cfg: any
    if (hasSupabaseEnv()) {
      const supabase = sb()
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'consultant_dashboard_config')
        .maybeSingle()
      cfg = (data as any)?.value
    } else {
      cfg = readLocalConfig().consultant_dashboard_config
    }
    cfg = cfg || { widgets: [], layout: {}, personalization: {} }
    res.json({ success: true, config: cfg })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.put('/v1/dashboard-layout/consultant', async (req: Request, res: Response) => {
  try {
    const payload = req.body || {}
    if (hasSupabaseEnv()) {
      const supabase = sb()
      const { data } = await supabase
        .from('settings')
        .select('key')
        .eq('key', 'consultant_dashboard_config')
        .maybeSingle()
      if (data) {
        await supabase
          .from('settings')
          .update({ value: payload })
          .eq('key', 'consultant_dashboard_config')
      } else {
        await supabase
          .from('settings')
          .insert({ key: 'consultant_dashboard_config', value: payload })
      }
    } else {
      writeLocalConfig({ consultant_dashboard_config: payload })
    }
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/v1/dashboard-layout/marketplace', async (_req: Request, res: Response) => {
  try {
    let cfg: any
    if (hasSupabaseEnv()) {
      const supabase = sb()
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'marketplace_dashboard_config')
        .maybeSingle()
      cfg = (data as any)?.value
    } else {
      cfg = readLocalConfig().marketplace_dashboard_config
    }
    cfg = cfg || { widgets: [], layout: {}, personalization: {} }
    res.json({ success: true, config: cfg })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.put('/v1/dashboard-layout/marketplace', async (req: Request, res: Response) => {
  try {
    const payload = req.body || {}
    if (hasSupabaseEnv()) {
      const supabase = sb()
      const { data } = await supabase
        .from('settings')
        .select('key')
        .eq('key', 'marketplace_dashboard_config')
        .maybeSingle()
      if (data) {
        await supabase
          .from('settings')
          .update({ value: payload })
          .eq('key', 'marketplace_dashboard_config')
      } else {
        await supabase
          .from('settings')
          .insert({ key: 'marketplace_dashboard_config', value: payload })
      }
    } else {
      writeLocalConfig({ marketplace_dashboard_config: payload })
    }
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Consumer endpoints for panels
router.get('/marketplace/dashboard/config', async (_req: Request, res: Response) => {
  try {
    let cfg: any
    if (hasSupabaseEnv()) {
      const supabase = sb()
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'marketplace_dashboard_config')
        .maybeSingle()
      cfg = (data as any)?.value
    } else {
      cfg = readLocalConfig().marketplace_dashboard_config
    }
    cfg = cfg || { widgets: [], layout: {}, personalization: {} }
    res.json({ success: true, config: cfg })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
