import { Router, Request, Response } from 'express'
import { supabase } from '../lib/supabaseClient'

const router = Router()

function requireTenant(req: Request, res: Response): string | undefined {
  const tenantId = String(req.query.tenantId || '').trim()
  if (!tenantId) { res.status(400).json({ success: false, error: 'tenantId requerido' }); return }
  return tenantId
}

router.get('/consultor/communications/announcements', async (req: Request, res: Response) => {
  const tenantId = requireTenant(req, res); if (!tenantId) return
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, data })
})

router.get('/consultor/communications/agenda', async (req: Request, res: Response) => {
  const tenantId = requireTenant(req, res); if (!tenantId) return
  try {
    let q = supabase.from('agenda_items').select('*').order('created_at', { ascending: false })
    // Tentar filtrar por tenant_id; se coluna não existir, cair para consulta sem filtro
    const { data, error } = await q.eq('tenant_id', tenantId)
    if (error && String(error.message).toLowerCase().includes('column')) {
      const { data: fallback, error: fbErr } = await supabase.from('agenda_items').select('*').order('created_at', { ascending: false })
      if (fbErr) return res.status(500).json({ success: false, error: fbErr.message })
      return res.json({ success: true, data: fallback })
    }
    if (error) return res.status(500).json({ success: false, error: error.message })
    res.json({ success: true, data })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/consultor/communications/trainings', async (req: Request, res: Response) => {
  const tenantId = requireTenant(req, res); if (!tenantId) return
  try {
    let q = supabase.from('trainings').select('*').order('order_index', { ascending: true })
    // is_published pode não existir em alguns schemas
    let { data, error } = await q.eq('is_published', true).eq('tenant_id', tenantId)
    if (error && String(error.message).toLowerCase().includes('column')) {
      const { data: fallback, error: fbErr } = await supabase.from('trainings').select('*').eq('tenant_id', tenantId).order('order_index', { ascending: true })
      if (fbErr) return res.status(500).json({ success: false, error: fbErr.message })
      return res.json({ success: true, data: fallback })
    }
    if (error) return res.status(500).json({ success: false, error: error.message })
    res.json({ success: true, data })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/consultor/communications/materials', async (req: Request, res: Response) => {
  const tenantId = requireTenant(req, res); if (!tenantId) return
  try {
    let q = supabase.from('download_materials').select('*').order('created_at', { ascending: false })
    let { data, error } = await q.eq('is_published', true).eq('tenant_id', tenantId)
    if (error && String(error.message).toLowerCase().includes('column')) {
      const { data: fallback, error: fbErr } = await supabase.from('download_materials').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false })
      if (fbErr) return res.status(500).json({ success: false, error: fbErr.message })
      return res.json({ success: true, data: fallback })
    }
    if (error) return res.status(500).json({ success: false, error: error.message })
    res.json({ success: true, data })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/consultor/communications/catalogs', async (req: Request, res: Response) => {
  const tenantId = requireTenant(req, res); if (!tenantId) return
  const { data, error } = await supabase
    .from('catalogs')
    .select('*')
    .eq('is_published', true)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, data })
})

// Confirmar visualização de comunicado
router.post('/consultor/communications/announcements/:id/ack', async (req: Request, res: Response) => {
  const tenantId = requireTenant(req, res); if (!tenantId) return
  const id = String(req.params.id || '')
  const userId = String((req.query as any).userId || (req.body?.userId) || '')
  if (!userId) return res.status(400).json({ success: false, error: 'userId requerido' })
  const { data: existing, error: selErr } = await supabase
    .from('announcement_acks')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('announcement_id', id)
    .eq('user_id', userId)
    .limit(1)
  if (selErr) return res.status(500).json({ success: false, error: selErr.message })
  if (existing && existing.length > 0) return res.json({ success: true })
  const { error } = await supabase
    .from('announcement_acks')
    .insert([{ tenant_id: tenantId, announcement_id: id, user_id: userId, confirmed: true }])
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

// Marcar lição como concluída
router.post('/consultor/communications/lessons/:lessonId/complete', async (req: Request, res: Response) => {
  const tenantId = requireTenant(req, res); if (!tenantId) return
  const lessonId = String(req.params.lessonId || '')
  const userId = String((req.query as any).userId || (req.body?.userId) || '')
  const trainingId = String((req.query as any).trainingId || (req.body?.trainingId) || '')
  if (!userId) return res.status(400).json({ success: false, error: 'userId requerido' })
  const { data: existing, error: selErr } = await supabase
    .from('training_progress')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .limit(1)
  if (selErr) return res.status(500).json({ success: false, error: selErr.message })
  if (existing && existing.length > 0) {
    const { error: updErr } = await supabase
      .from('training_progress')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('id', existing[0].id)
    if (updErr) return res.status(500).json({ success: false, error: updErr.message })
    return res.json({ success: true })
  }
  const { error } = await supabase
    .from('training_progress')
    .insert([{ tenant_id: tenantId, user_id: userId, training_id: trainingId || null, lesson_id: lessonId, completed: true }])
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

export default router
