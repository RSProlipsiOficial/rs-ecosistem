import { Router } from 'express'
import { supabase } from '../repositories/supabase.client'
import { bonusRepo } from '../repositories/bonuses.repository'
import { matrixRepo } from '../repositories/matrix.repository'
import { getSigmaConfig } from '../services/sigmaConfigService'

const router = Router()

/**
 * POST /admin/sigma/process-cycle
 * Body:
 * {
 *   buyer_id: string,
 *   cycle_value?: number,
 *   uplines: Array<{ id: string, nivel: number }>, // L1..L6
 *   fidelity?: Array<{ id: string, peso: number }>,
 *   top10?: Array<{ id: string, posicao: number }>
 * }
 * Persiste em: matrices, cycle_events, bonuses, wallet_transactions
 */
router.post('/admin/sigma/process-cycle', async (req, res) => {
  try {
    const { buyer_id, cycle_value, uplines = [], fidelity = [] } = req.body || {}
    if (!buyer_id) return res.status(400).json({ success: false, error: 'buyer_id é obrigatório' })

    const cfg = await getSigmaConfig()
    const cycleBase = Number(cycle_value ?? cfg.cycle.value)

    // 1) Registrar ciclo (matrices)
    await matrixRepo.registerCycle(buyer_id, 1)
    await supabase.from('cycle_events').insert({
      user_id: buyer_id,
      event_type: 'sigma_cycle_processed',
      amount: cycleBase,
      created_at: new Date().toISOString()
    })

    // 2) Bônus de ciclo para o comprador
    const cyclePayout = +(cycleBase * (cfg.cycle.payoutPercent / 100)).toFixed(2)
    await bonusRepo.insert(buyer_id, 'cycle', cyclePayout)
    await creditWallet(buyer_id, cyclePayout, `Bônus de ciclo SIGMA`)

    // 3) Profundidade (uplines)
    const depthPool = +(cycleBase * (cfg.depthBonus.basePercent / 100)).toFixed(2)
    const weights = cfg.depthBonus.levels.map(l => l.percent)
    const sum = weights.reduce((a, b) => a + b, 0) || 1
    for (const up of uplines) {
      const levelCfg = cfg.depthBonus.levels.find(l => l.level === up.nivel)
      if (!levelCfg) continue
      const amount = +((depthPool * levelCfg.percent) / sum).toFixed(2)
      await bonusRepo.insert(up.id, 'depth', amount)
      await creditWallet(up.id, amount, `Bônus profundidade L${up.nivel} de ${buyer_id}`)
    }

    // 4) Fidelidade (opcional via input)
    if (Array.isArray(fidelity) && fidelity.length) {
      const fidPool = +(cycleBase * (cfg.fidelityBonus.percentTotal / 100)).toFixed(2)
      const totalPeso = fidelity.reduce((s, f) => s + Number(f.peso || 0), 0) || 1
      for (const f of fidelity) {
        const amt = +((fidPool * (Number(f.peso || 0) / totalPeso))).toFixed(2)
        await bonusRepo.insert(f.id, 'fidelity', amt)
        await creditWallet(f.id, amt, `Bônus fidelidade sobre ciclo de ${buyer_id}`)
      }
    }

    // 5) Top10 automático do período
    {
      const topPool = +(cycleBase * (cfg.topSigma.percentTotal / 100)).toFixed(2)
      const rankPct = new Map(cfg.topSigma.ranks.map(r => [r.rank, r.percent]))
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
      const { data: events } = await supabase
        .from('cycle_events')
        .select('consultor_id, created_at')
        .eq('event_type', 'cycle_completed')
        .gte('created_at', monthStart)
        .lt('created_at', monthEnd)
      const counts = new Map<string, number>()
      for (const e of (events || [])) {
        const id = String((e as any).consultor_id)
        counts.set(id, (counts.get(id) || 0) + 1)
      }
      const { data: consultores } = await supabase.from('consultores').select('id, patrocinador_id')
      const children = new Map<string, string[]>()
      for (const c of (consultores || [])) {
        const pid = String((c as any).patrocinador_id || '')
        const cid = String((c as any).id)
        if (!pid) continue
        const arr = children.get(pid) || []
        arr.push(cid)
        children.set(pid, arr)
      }
      async function isActiveInMonth(consultorId: string): Promise<boolean> {
        const { data } = await supabase
          .from('orders')
          .select('matrix_accumulated, payment_status, status, payment_date')
          .eq('buyer_id', consultorId)
          .gte('payment_date', monthStart)
          .lt('payment_date', monthEnd)
          .in('payment_status', ['approved', 'paid'])
          .in('status', ['paid', 'processing', 'delivered'])
        const sum = (data || []).reduce((s, o: any) => s + Number(o.matrix_accumulated || 0), 0)
        return sum >= 60
      }
      function getTeam(root: string): string[] {
        const team: string[] = [root]
        const queue: string[] = [...(children.get(root) || [])]
        while (queue.length) {
          const cur = queue.shift() as string
          team.push(cur)
          const kids = children.get(cur) || []
          for (const k of kids) queue.push(k)
        }
        return team
      }
      const totals: Array<{ id: string; total: number }> = []
      for (const c of (consultores || [])) {
        const id = String((c as any).id)
        if (!(await isActiveInMonth(id))) continue
        const team = getTeam(id)
        let total = 0
        for (const t of team) total += counts.get(t) || 0
        totals.push({ id, total })
      }
      const sorted = totals.sort((a, b) => b.total - a.total).slice(0, 10)
      let pos = 1
      for (const entry of sorted) {
        const pct = rankPct.get(pos) || 0
        const amt = +((topPool * (pct / 100))).toFixed(2)
        await bonusRepo.insert(entry.id, 'topSigma', amt)
        await creditWallet(entry.id, amt, `Bônus Top SIGMA posição ${pos}`)
        pos++
      }
    }

    res.json({ success: true, cycle: { buyer_id, cycle_value: cycleBase }, cyclePayout, depthPool })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

async function creditWallet(userId: string, amount: number, description: string) {
  // Atualiza saldo e insere transação
  const { data: wallet } = await supabase
    .from('wallets')
    .select('saldo_disponivel, saldo_total')
    .eq('consultor_id', userId)
    .single()
  const available = Number(wallet?.saldo_disponivel || 0)
  const newBalance = +(available + amount).toFixed(2)
  await supabase
    .from('wallets')
    .update({ saldo_disponivel: newBalance, saldo_total: newBalance, updated_at: new Date().toISOString() })
    .eq('consultor_id', userId)
  await supabase
    .from('wallet_transactions')
    .insert({ user_id: userId, type: 'credit', amount, description, balance_after: newBalance, created_at: new Date().toISOString() })
}

export default router
