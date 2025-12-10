import { Router, Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import { getSigmaConfig } from '../services/sigmaConfigService'

const router = Router()

function sb() {
  const url = process.env.SUPABASE_URL as string
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY) as string
  return createClient(url, key)
}

router.get('/admin/consultants', async (_req: Request, res: Response) => {
  try {
    const supabase = sb()
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()

    const { data: consultores } = await supabase
      .from('consultores')
      .select('*')

    const ids = (consultores || []).map(c => String((c as any).id))
    const codeByUuid = new Map<string, string>()
    const nameByUuid = new Map<string, string>()
    for (const c of (consultores || [])) {
      const uuid = String((c as any).id)
      const code = String((c as any).codigo_consultor || '')
      codeByUuid.set(uuid, code)
      nameByUuid.set(uuid, String((c as any).nome || ''))
    }

    // Fetch wallets
    const { data: wallets } = await supabase
      .from('wallets')
      .select('consultor_id, balance')
      .in('consultor_id', ids)

    const walletMap = new Map<string, number>()
    if (wallets) {
      wallets.forEach((w: any) => walletMap.set(w.consultor_id, w.balance))
    }

    const { data: orders } = await supabase
      .from('orders')
      .select('buyer_id, total, matrix_accumulated, payment_status, status, payment_date')
      .in('buyer_id', ids)
      .gte('payment_date', monthStart)
      .lt('payment_date', monthEnd)
      .in('payment_status', ['approved', 'paid'])
      .in('status', ['paid', 'processing', 'delivered'])

    const { data: events } = await supabase
      .from('cycle_events')
      .select('consultor_id, event_type, created_at')
      .eq('event_type', 'cycle_completed')
      .gte('created_at', monthStart)
      .lt('created_at', monthEnd)

    // build sponsor children map keyed by codigo_consultor (numeric short ID)
    const childrenByCode = new Map<string, string[]>()
    for (const c of (consultores || [])) {
      const pidUuid = String((c as any).patrocinador_id || '')
      const pidCode = pidUuid ? (codeByUuid.get(pidUuid) || '') : ''
      const cidCode = String((c as any).codigo_consultor || '')
      if (!pidCode || !cidCode) continue
      const arr = childrenByCode.get(pidCode) || []
      arr.push(cidCode)
      childrenByCode.set(pidCode, arr)
    }
    const directsCountMapByCode = new Map<string, number>()
    for (const [pid, arr] of childrenByCode.entries()) directsCountMapByCode.set(pid, arr.length)

    function teamOfCodes(rootCode: string): string[] {
      const team: string[] = []
      const q: string[] = [...(childrenByCode.get(rootCode) || [])]
      while (q.length) {
        const curCode = q.shift() as string
        team.push(curCode)
        const kids = childrenByCode.get(curCode) || []
        for (const k of kids) q.push(k)
      }
      return team
    }

    const ordersByBuyer = new Map<string, { total: number; matrix: number }>()
    for (const o of (orders || [])) {
      const id = String((o as any).buyer_id)
      const prev = ordersByBuyer.get(id) || { total: 0, matrix: 0 }
      prev.total += Number((o as any).total || 0)
      prev.matrix += Number((o as any).matrix_accumulated || 0)
      ordersByBuyer.set(id, prev)
    }

    const cyclesByConsultor = new Map<string, number>()
    for (const e of (events || [])) {
      const id = String((e as any).consultor_id)
      cyclesByConsultor.set(id, (cyclesByConsultor.get(id) || 0) + 1)
    }

    const cfg = await getSigmaConfig()

    // Top Sigma ranking by team cycles (compute on UUIDs, display on codes)
    const totalsForTop: Array<{ uuid: string; total: number }> = []
    for (const c of (consultores || [])) {
      const uuid = String((c as any).id)
      const buyerMonth = ordersByBuyer.get(uuid)
      const sigmaActive = (buyerMonth?.matrix || 0) >= 60
      if (!sigmaActive) continue
      let total = cyclesByConsultor.get(uuid) || 0
      const code = String((c as any).codigo_consultor || '')
      const teamCodes = teamOfCodes(code)
      for (const memberCode of teamCodes) {
        const memberUuid = [...codeByUuid.entries()].find(([, ccode]) => ccode === memberCode)?.[0]
        if (memberUuid) total += cyclesByConsultor.get(memberUuid) || 0
      }
      totalsForTop.push({ uuid, total })
    }
    const sortedTop = totalsForTop.sort((a, b) => b.total - a.total)
    const positionByUuid = new Map<string, number>()
    sortedTop.forEach((e, i) => { if (i < 10) positionByUuid.set(e.uuid, i + 1) })

    const enriched = (consultores || []).map(c => {
      const uuid = String((c as any).id)
      const code = String((c as any).codigo_consultor || '')
      const buyerMonth = ordersByBuyer.get(uuid) || { total: 0, matrix: 0 }
      const sigmaActive = buyerMonth.matrix >= 60
      const sigmaCyclesMonth = cyclesByConsultor.get(uuid) || 0
      const careerPoints = Number((c as any).total_ciclos || 0)
      const pins = cfg.career.pins
      const currentPin = pins.reduce((acc, p) => (careerPoints >= p.cyclesRequired ? p.name : acc), pins[0]?.name || 'Iniciante')
      const nextPinObj = pins.find(p => careerPoints < p.cyclesRequired) || null
      const careerPinNext = nextPinObj ? { name: nextPinObj.name, pointsRemaining: Math.max(0, nextPinObj.cyclesRequired - careerPoints) } : null
      const topSigmaPosition = positionByUuid.get(uuid) || null
      const directsCount = directsCountMapByCode.get(code) || 0
      const teamSize = teamOfCodes(code).length
      const totalSales = buyerMonth.total
      let teamSales = 0
      for (const memberCode of teamOfCodes(code)) {
        const memberUuid = [...codeByUuid.entries()].find(([, ccode]) => ccode === memberCode)?.[0]
        if (memberUuid) {
          const agg = ordersByBuyer.get(memberUuid)
          if (agg) teamSales += agg.total
        }
      }

      // Map status to Title Case
      let status = (c as any).status || 'Pendente'
      if (status === 'ativo') status = 'Ativo'
      else if (status === 'inativo') status = 'Inativo'
      else if (status === 'bloqueado') status = 'Inativo'
      else status = status.charAt(0).toUpperCase() + status.slice(1)

      return {
        id: code || (c as any).id,
        uuid,
        code,
        username: (c as any).username || '',
        name: (c as any).nome,
        avatar: (c as any).avatar || '',
        pin: (c as any).pin_atual || 'Iniciante',
        status: status,
        network: 'RS Prólipsi',
        balance: walletMap.get(uuid) || 0,
        cpfCnpj: (c as any).cpf || '',
        contact: { email: (c as any).email || '', phone: (c as any).telefone || '' },
        address: { city: (c as any).cidade || '', state: (c as any).estado || '', street: '', zip: '' },
        sponsor: (c as any).patrocinador_id ? { id: (codeByUuid.get(String((c as any).patrocinador_id)) || String((c as any).patrocinador_id)), name: (nameByUuid.get(String((c as any).patrocinador_id)) || '') } : null,
        registrationDate: (c as any).created_at || new Date().toISOString(),
        sigmaActive,
        sigmaCyclesMonth,
        careerPoints,
        careerPinCurrent: currentPin,
        careerPinNext,
        topSigmaPosition,
        totalSales,
        teamSales,
        directsCount,
        teamSize
      }
    })

    res.json({ success: true, consultants: enriched })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
