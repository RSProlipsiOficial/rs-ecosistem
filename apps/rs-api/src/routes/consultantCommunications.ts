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

// Listar treinamentos (módulos)
router.get('/consultor/communications/trainings', async (req: Request, res: Response) => {
  const tenantId = requireTenant(req, res); if (!tenantId) return
  try {
    // Mapeando para treinamento_modulos
    // Assumindo que "Treinamentos" na view do consultor são os Módulos criados no Admin
    let q = supabase.from('treinamento_modulos').select('*').order('created_at', { ascending: true })
    let { data, error } = await q.eq('tenant_id', tenantId)

    if (error) return res.status(500).json({ success: false, error: error.message })

    // Mapear campos para compatibilidade se necessário, ou retornar direto
    // O frontend espera: id, title, description, cover_image?
    // DB tem: id, titulo, descricao, capa_url, icone
    const mapped = data?.map(m => ({
      id: m.id,
      title: m.titulo,
      description: m.descricao,
      cover_image: m.capa_url,
      iconName: m.icone // Passando icone original
    }))

    res.json({ success: true, data: mapped })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// Listar catálogos
router.get('/consultor/communications/catalogs', async (req: Request, res: Response) => {
  const tenantId = requireTenant(req, res); if (!tenantId) return
  const { data, error } = await supabase
    .from('catalogs')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, data })
})

// Listar materiais para download
router.get('/consultor/communications/materials', async (req: Request, res: Response) => {
  const tenantId = requireTenant(req, res); if (!tenantId) return
  const { data, error } = await supabase
    .from('download_materials')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, data })
})

// LISTAR LIÇÕES
router.get('/consultor/communications/lessons', async (req: Request, res: Response) => {
  const tenantId = requireTenant(req, res); if (!tenantId) return
  // O frontend pode passar trainingId (que na verdade é modulo_id no nosso novo esquema) ou moduleId
  const trainingId = String(req.query.trainingId || '')
  const moduleId = String(req.query.moduleId || '')

  const targetId = moduleId || trainingId // Prioriza moduleId se vier, senão usa trainingId (que seria o ID do módulo pai)

  if (!targetId) return res.status(400).json({ success: false, error: 'trainingId ou moduleId requerido' })

  let q = supabase.from('treinamento_aulas')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('modulo_id', targetId) // Mapeia para modulo_id
    .order('created_at', { ascending: true })

  const { data, error } = await q
  if (error) return res.status(500).json({ success: false, error: error.message })

  // Mapear campos
  // Frontend: id, title, video_url
  // DB: id, titulo, link_video
  const mapped = data?.map(l => ({
    id: l.id,
    title: l.titulo,
    description: l.descricao,
    video_url: l.link_video,
    module_id: l.modulo_id,
    order_index: 0 // TODO: Adicionar ordem no DB se precisar
  }))

  res.json({ success: true, data: mapped })
})

// Obter progresso do usuário
router.get('/consultor/communications/training-progress', async (req: Request, res: Response) => {
  const tenantId = requireTenant(req, res); if (!tenantId) return
  const userId = String((req.query as any).userId || '')
  if (!userId) return res.status(400).json({ success: false, error: 'userId requerido' })

  const { data, error } = await supabase
    .from('training_progress')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('user_id', userId)

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, data })
})

// Deprecated endpoint (keeps compatibility)
router.get('/consultor/communications/training-modules', async (req: Request, res: Response) => {
  res.json({ success: true, data: [] })
})

export default router
