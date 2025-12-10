import { Router, Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import { getSigmaConfig } from '../services/sigmaConfigService'

const router = Router()
function sb() {
  const url = process.env.SUPABASE_URL as string
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY) as string
  return createClient(url, key)
}

router.get('/admin/reports/general', async (req: Request, res: Response) => {
  try {
    const consultantId = String(req.query.consultantId || '')
    if (!consultantId) return res.status(400).json({ success: false, error: 'consultantId requerido' })
    const supabase = sb()
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
    const cfg = await getSigmaConfig()

    const { data: c } = await supabase
      .from('consultores')
      .select('id, name, avatar, pin, status, cpf_cnpj, email, phone, city, state, patrocinador_id, registration_date, career_points')
      .eq('id', consultantId)
      .single()

    const { data: ordersAll } = await supabase
      .from('orders')
      .select('id, buyer_id, total, matrix_accumulated, payment_status, status, payment_date')
      .eq('buyer_id', consultantId)
      .in('payment_status', ['approved', 'paid'])
      .in('status', ['paid', 'processing', 'delivered'])

    const ordersMonth = (ordersAll || []).filter(o => (o as any).payment_date >= monthStart && (o as any).payment_date < monthEnd)
    const totalSalesMonth = ordersMonth.reduce((s, o: any) => s + Number(o.total || 0), 0)
    const totalSalesAccum = (ordersAll || []).reduce((s, o: any) => s + Number(o.total || 0), 0)
    const sigmaActive = ordersMonth.reduce((s, o: any) => s + Number(o.matrix_accumulated || 0), 0) >= 60

    const { data: evMonth } = await supabase
      .from('cycle_events')
      .select('consultor_id, event_type, created_at')
      .eq('event_type', 'cycle_completed')
      .gte('created_at', monthStart)
      .lt('created_at', monthEnd)

    const cyclesMonth = (evMonth || []).filter(e => String((e as any).consultor_id) === consultantId).length

    // bonuses
    const { data: bonusesMonth } = await supabase
      .from('bonuses')
      .select('user_id, type, amount, created_at')
      .gte('created_at', monthStart)
      .lt('created_at', monthEnd)

    const bonusTypes = ['cycle', 'depth', 'fidelity', 'topSigma', 'career']
    const bonusSummaryMonth: Record<string, number> = {}
    const bonusSummaryAccum: Record<string, number> = {}
    for (const t of bonusTypes) { bonusSummaryMonth[t] = 0; bonusSummaryAccum[t] = 0 }
    for (const b of (bonusesMonth || [])) {
      if (String((b as any).user_id) !== consultantId) continue
      const t = String((b as any).type)
      bonusSummaryMonth[t] = (bonusSummaryMonth[t] || 0) + Number((b as any).amount || 0)
    }
    const { data: bonusesAll } = await supabase
      .from('bonuses')
      .select('user_id, type, amount')
    for (const b of (bonusesAll || [])) {
      if (String((b as any).user_id) !== consultantId) continue
      const t = String((b as any).type)
      bonusSummaryAccum[t] = (bonusSummaryAccum[t] || 0) + Number((b as any).amount || 0)
    }

    // network metrics
    const { data: all } = await supabase
      .from('consultores')
      .select('id, patrocinador_id, pin')
    const children = new Map<string, string[]>()
    for (const n of (all || [])) {
      const pid = String((n as any).patrocinador_id || '')
      const cid = String((n as any).id)
      if (!pid) continue
      const arr = children.get(pid) || []
      arr.push(cid)
      children.set(pid, arr)
    }
    const directs = (children.get(consultantId) || []).length
    function teamOf(root: string): string[] { const team: string[] = []; const q = [...(children.get(root) || [])]; while (q.length) { const cur = q.shift() as string; team.push(cur); const kids = children.get(cur) || []; for (const k of kids) q.push(k) } return team }
    const teamIds = teamOf(consultantId)
    const teamSize = teamIds.length
    const pinDistribution: Record<string, number> = {}
    for (const id of teamIds) {
      const found = (all || []).find(x => String((x as any).id) === id)
      const pin = String((found as any)?.pin || 'Iniciante')
      pinDistribution[pin] = (pinDistribution[pin] || 0) + 1
    }

    // top sigma position by team cycles
    const cyclesBy = new Map<string, number>()
    for (const e of (evMonth || [])) {
      const id = String((e as any).consultor_id)
      cyclesBy.set(id, (cyclesBy.get(id) || 0) + 1)
    }
    let teamCyclesTotal = cyclesBy.get(consultantId) || 0
    for (const t of teamIds) teamCyclesTotal += cyclesBy.get(t) || 0
    // compute ranking positions for active consultants
    const activeIds: string[] = []
    for (const x of (all || [])) {
      const xId = String((x as any).id)
      const { data: o } = await supabase
        .from('orders')
        .select('matrix_accumulated, payment_status, status, payment_date')
        .eq('buyer_id', xId)
        .gte('payment_date', monthStart)
        .lt('payment_date', monthEnd)
        .in('payment_status', ['approved', 'paid'])
        .in('status', ['paid', 'processing', 'delivered'])
      const sum = (o || []).reduce((s, r: any) => s + Number(r.matrix_accumulated || 0), 0)
      if (sum >= 60) activeIds.push(xId)
    }
    const totals = activeIds.map(id => {
      let tot = cyclesBy.get(id) || 0
      for (const m of teamOf(id)) tot += cyclesBy.get(m) || 0
      return { id, total: tot }
    }).sort((a, b) => b.total - a.total)
    const posIndex = totals.findIndex(t => t.id === consultantId)
    const topSigmaPosition = posIndex >= 0 && posIndex < 10 ? (posIndex + 1) : null

    const careerPoints = Number((c as any)?.career_points || 0)
    const pins = cfg.career.pins
    const careerPinCurrent = pins.reduce((acc, p) => (careerPoints >= p.cyclesRequired ? p.name : acc), pins[0]?.name || 'Iniciante')
    const nextPinObj = pins.find(p => careerPoints < p.cyclesRequired) || null
    const careerPinNext = nextPinObj ? { name: nextPinObj.name, pointsRemaining: Math.max(0, nextPinObj.cyclesRequired - careerPoints) } : null

    res.json({
      success: true,
      report: {
        identity: {
          id: (c as any).id, name: (c as any).name, email: (c as any).email, phone: (c as any).phone,
          cpfCnpj: (c as any).cpf_cnpj, city: (c as any).city, state: (c as any).state, status: (c as any).status,
          pin: (c as any).pin, sigmaActive
        },
        sigma: {
          cyclesMonth, cyclesTotal: null,
          bonusMonth: bonusSummaryMonth, bonusAccum: bonusSummaryAccum,
          topSigmaPosition,
          careerPoints,
          careerPinCurrent,
          careerPinNext
        },
        sales: {
          lastOrders: (ordersAll || []).slice(-30),
          totalSalesMonth,
          totalSalesAccum
        },
        network: {
          directs,
          teamSize,
          pinDistribution
        }
      }
    })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
