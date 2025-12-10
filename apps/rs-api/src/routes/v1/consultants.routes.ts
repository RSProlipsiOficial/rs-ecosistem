import express, { Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'

const router = express.Router()

function sb() {
  const url = process.env.SUPABASE_URL as string
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY) as string
  return createClient(url, key)
}

router.get('/lookup', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim()
    if (!q) return res.json({ success: true, results: [] })
    const s = sb()
    const like = `%${q}%`
    const { data } = await s
      .from('consultores')
      .select('id, nome, codigo_consultor, username')
      .or(`codigo_consultor.eq.${q},username.eq.${q},nome.ilike.${like}`)
    const results = (data || []).map(r => ({
      id: (r as any).id,
      code: (r as any).codigo_consultor || '',
      username: (r as any).username || '',
      name: (r as any).nome || ''
    }))
    res.json({ success: true, results })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const payload = req.body || {}
    const nome = String(payload.nome || '').trim()
    const email = String(payload.email || '').trim().toLowerCase()
    const telefone = payload.telefone ? String(payload.telefone).replace(/\D/g, '') : null
    const cpf = payload.cpf ? String(payload.cpf).replace(/\D/g, '') : null
    const username = String(payload.username || '').trim().toLowerCase()
    const codigo = String(payload.codigo_consultor || '').trim()
    const senha = String(payload.senha || '')
    const pin = String(payload.pin_inicial || 'Consultor')
    const sponsorRef = payload.patrocinador_ref ? String(payload.patrocinador_ref).trim() : ''

    if (!nome || !email || !username || !codigo) {
      return res.status(400).json({ success: false, error: 'Campos obrigatórios ausentes' })
    }

    const s = sb()

    const { data: byCode } = await s.from('consultores').select('id').eq('codigo_consultor', codigo).maybeSingle()
    if (byCode) return res.status(409).json({ success: false, error: 'ID numérico já utilizado' })

    const { data: byUser } = await s.from('consultores').select('id').eq('username', username).maybeSingle()
    if (byUser) return res.status(409).json({ success: false, error: 'Login já utilizado' })

    const { data: byEmail } = await s.from('consultores').select('id').eq('email', email).maybeSingle()
    if (byEmail) return res.status(409).json({ success: false, error: 'E-mail já utilizado' })

    let sponsorId: string | null = null
    if (sponsorRef) {
      const { data: bySponsorCode } = await s.from('consultores').select('id').eq('codigo_consultor', sponsorRef).maybeSingle()
      sponsorId = bySponsorCode?.id || null
      if (!sponsorId) {
        const { data: bySponsorUser } = await s.from('consultores').select('id').eq('username', sponsorRef).maybeSingle()
        sponsorId = bySponsorUser?.id || null
      }
      if (!sponsorId) {
        const { data: bySponsorName } = await s.from('consultores').select('id').ilike('nome', sponsorRef).maybeSingle()
        sponsorId = bySponsorName?.id || null
      }
    }

    const authRes = await s.auth.admin.createUser({ email, password: senha || 'RS123', email_confirm: true, user_metadata: { name: nome } })
    if (authRes.error) return res.status(500).json({ success: false, error: authRes.error.message })
    const userId = authRes.data.user.id

    let supportsAtivoSigma = false
    try {
      await s.from('consultores').select('id, ativo_sigma').limit(1)
      supportsAtivoSigma = true
    } catch { }

    const insertPayload: any = {
      user_id: userId,
      nome,
      email,
      cpf,
      telefone,
      patrocinador_id: sponsorId,
      status: 'ativo',
      pin_atual: pin,
      codigo_consultor: codigo,
      username
    }
    if (supportsAtivoSigma) {
      insertPayload.ativo_sigma = Boolean(payload.ativo_sigma)
    }

    const { data: ins, error: dbErr } = await s.from('consultores').insert(insertPayload).select('id').maybeSingle()
    if (dbErr) {
      await s.auth.admin.deleteUser(userId)
      return res.status(500).json({ success: false, error: dbErr.message })
    }

    const consultorId = (ins as any)?.id
    if (consultorId) {
      await s.from('wallets').insert({ user_id: userId, consultor_id: consultorId, status: 'ativa', balance: 0 })
    }

    res.json({ success: true, consultant_id: consultorId })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/spreadsheet-model', async (req: Request, res: Response) => {
  try {
    const format = String(req.query.format || 'xlsx').toLowerCase()

    const consultoresHeaders = [
      'id_numerico',
      'nome',
      'email',
      'telefone',
      'cpf',
      'login',
      'senha',
      'pin_inicial',
      'ativo_sigma'
    ]

    const patrocinadoresHeaders = [
      'id_numerico_consultor',
      'id_numerico_patrocinador'
    ]

    if (format === 'xlsx') {
      const wb = XLSX.utils.book_new()
      const wsConsultores = XLSX.utils.aoa_to_sheet([consultoresHeaders])
      const wsPatrocinadores = XLSX.utils.aoa_to_sheet([patrocinadoresHeaders])
      XLSX.utils.book_append_sheet(wb, wsConsultores, 'consultores')
      XLSX.utils.book_append_sheet(wb, wsPatrocinadores, 'patrocinadores')
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', 'attachment; filename="modelo_rs_consultores.xlsx"')
      return res.send(buf)
    }

    if (format === 'csv') {
      const csvConsultores = consultoresHeaders.join(',') + '\n'
      const csvPatrocinadores = patrocinadoresHeaders.join(',') + '\n'
      return res.json({ success: true, consultores: csvConsultores, patrocinadores: csvPatrocinadores })
    }

    return res.status(400).json({ success: false, error: 'Formato inválido. Use xlsx ou csv.' })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
