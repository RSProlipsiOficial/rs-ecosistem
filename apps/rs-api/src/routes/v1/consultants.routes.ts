import express, { Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'
import {
  collectExistingIdentifiers,
  isPlaceholderIdentifier,
  normalizeDigits,
  resolveConsultantIdentifiers,
  sanitizeLoginCandidate,
} from '../../utils/consultantIdentifiers'

const router = express.Router()

function sb() {
  const url = process.env.SUPABASE_URL as string
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY) as string
  return createClient(url, key)
}

const isUuid = (value?: string | null) =>
  Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value).trim()))

router.get('/lookup', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim()
    if (!q) return res.json({ success: true, results: [] })
    const s = sb()
    const like = `%${q}%`
    const { data } = await s
      .from('consultores')
      .select('id, nome, email, codigo_consultor, username')
      .or(`codigo_consultor.eq.${q},username.eq.${q},nome.ilike.${like}`)

    const { usedCodes, usedLogins } = collectExistingIdentifiers(data || [])
    const results = (data || []).map((row) => {
      const identifiers = resolveConsultantIdentifiers({
        consultor: row,
        usedCodes,
        usedLogins,
      })

      return {
        id: (row as any).id,
        code: identifiers.accountCode,
        username: identifiers.loginId,
        name: (row as any).nome || '',
      }
    })

    res.json({ success: true, results })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/lookup-details', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim()
    if (!q) return res.json({ success: true, result: null })

    const s = sb()
    const normalizedDigits = normalizeDigits(q)
    const normalizedLogin = sanitizeLoginCandidate(q)
    const like = `%${q}%`
    const consultorSelect = 'id, user_id, nome, email, username, whatsapp, telefone, patrocinador_id'
    let consultor: any = null

    if (isUuid(q)) {
      const byId = await s
        .from('consultores')
        .select(consultorSelect)
        .eq('id', q)
        .maybeSingle()

      consultor = byId.data || null
    }

    let profileByNumeric: any = null
    if (!consultor && normalizedDigits) {
      const byNumeric = await s
        .from('user_profiles')
        .select('*')
        .eq('id_numerico', normalizedDigits)
        .maybeSingle()

      profileByNumeric = byNumeric.data || null

      if (profileByNumeric?.user_id) {
        const byUserId = await s
          .from('consultores')
          .select(consultorSelect)
          .eq('user_id', profileByNumeric.user_id)
          .maybeSingle()

        consultor = byUserId.data || null
      }
    }

    if (!consultor && normalizedLogin) {
      const byUsername = await s
        .from('consultores')
        .select(consultorSelect)
        .eq('username', normalizedLogin)
        .maybeSingle()

      consultor = byUsername.data || null
    }

    if (!consultor && q.includes('@')) {
      const byEmail = await s
        .from('consultores')
        .select(consultorSelect)
        .eq('email', q.toLowerCase())
        .maybeSingle()

      consultor = byEmail.data || null
    }

    if (!consultor) {
      const byName = await s
        .from('consultores')
        .select(consultorSelect)
        .ilike('nome', like)
        .limit(1)

      consultor = (byName.data || [])[0] || null
    }

    if (!consultor) {
      return res.json({ success: true, result: null })
    }

    let profile: any = profileByNumeric || null
    if (!profile && consultor.user_id) {
      const profileResult = await s
        .from('user_profiles')
        .select('*')
        .eq('user_id', consultor.user_id)
        .maybeSingle()

      profile = profileResult.data || null
    }

    return res.json({
      success: true,
      result: {
        id: String(consultor.id || ''),
        name: String(profile?.nome_completo || consultor.nome || ''),
        email: String(profile?.email || consultor.email || ''),
        whatsapp: String(profile?.whatsapp || profile?.telefone || consultor.whatsapp || consultor.telefone || ''),
        loginId: String(profile?.slug || consultor.username || ''),
        numericId: String(profile?.id_numerico || ''),
        sponsorId: String(consultor.patrocinador_id || profile?.sponsor_id || profile?.patrocinador_id || ''),
      }
    })
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
    const requestedLogin = sanitizeLoginCandidate(payload.username)
    const requestedCode = normalizeDigits(payload.codigo_consultor)
    const senha = String(payload.senha || '')
    const pin = String(payload.pin_inicial || 'Consultor')
    const sponsorRef = payload.patrocinador_ref ? String(payload.patrocinador_ref).trim() : ''

    if (!nome || !email) {
      return res.status(400).json({ success: false, error: 'Campos obrigatorios ausentes' })
    }

    const s = sb()

    const { data: existingRows } = await s
      .from('consultores')
      .select('id, user_id, nome, email, username, codigo_consultor')

    const { usedCodes, usedLogins } = collectExistingIdentifiers(existingRows || [])

    if (requestedCode && !isPlaceholderIdentifier(requestedCode) && usedCodes.has(requestedCode)) {
      return res.status(409).json({ success: false, error: 'ID numerico ja utilizado' })
    }

    if (requestedLogin && !isPlaceholderIdentifier(requestedLogin) && usedLogins.has(requestedLogin)) {
      return res.status(409).json({ success: false, error: 'Login ja utilizado' })
    }

    const identifiers = resolveConsultantIdentifiers({
      consultor: {
        id: email,
        user_id: email,
        nome,
        email,
        username: requestedLogin,
        codigo_consultor: requestedCode,
      },
      usedCodes,
      usedLogins,
    })

    const codigo = identifiers.accountCode
    const username = identifiers.loginId

    const { data: byEmail } = await s.from('consultores').select('id').eq('email', email).maybeSingle()
    if (byEmail) return res.status(409).json({ success: false, error: 'E-mail ja utilizado' })

    let sponsorId: string | null = null
    if (sponsorRef) {
      const normalizedSponsor = sponsorRef.trim()
      const { data: bySponsorCode } = await s
        .from('consultores')
        .select('id')
        .eq('codigo_consultor', normalizeDigits(normalizedSponsor))
        .maybeSingle()
      sponsorId = bySponsorCode?.id || null

      if (!sponsorId) {
        const { data: bySponsorUser } = await s
          .from('consultores')
          .select('id')
          .eq('username', sanitizeLoginCandidate(normalizedSponsor))
          .maybeSingle()
        sponsorId = bySponsorUser?.id || null
      }

      if (!sponsorId) {
        const { data: bySponsorName } = await s
          .from('consultores')
          .select('id')
          .ilike('nome', normalizedSponsor)
          .maybeSingle()
        sponsorId = bySponsorName?.id || null
      }
    }

    const authRes = await s.auth.admin.createUser({
      email,
      password: senha || 'RS123',
      email_confirm: true,
      user_metadata: { name: nome },
    })
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
      username,
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
      await s.from('user_profiles').update({ id_numerico: codigo }).eq('user_id', userId)
    }

    res.json({ success: true, consultant_id: consultorId, codigo_consultor: codigo, username })
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
      res.setHeader('Content-Disposition', 'attachment; filename=\"modelo_rs_consultores.xlsx\"')
      return res.send(buf)
    }

    if (format === 'csv') {
      const csvConsultores = consultoresHeaders.join(',') + '\n'
      const csvPatrocinadores = patrocinadoresHeaders.join(',') + '\n'
      return res.json({ success: true, consultores: csvConsultores, patrocinadores: csvPatrocinadores })
    }

    return res.status(400).json({ success: false, error: 'Formato invalido. Use xlsx ou csv.' })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
