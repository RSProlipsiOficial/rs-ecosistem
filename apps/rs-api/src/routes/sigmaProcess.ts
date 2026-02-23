import { Router } from 'express'
import { supabase } from '../repositories/supabase.client'
import { matrixRepo } from '../repositories/matrix.repository'
import { getSigmaConfig } from '../services/sigmaConfigService'

const router = Router()

/**
 * POST /admin/sigma/process-cycle
 * Permite processar um ciclo manualmente via Admin, disparando o motor de bônus oficial do rs-core.
 */
router.post('/admin/sigma/process-cycle', async (req, res) => {
  try {
    const { buyer_id, cycle_value, cycle_id } = req.body || {}
    if (!buyer_id) return res.status(400).json({ success: false, error: 'buyer_id é obrigatório' })

    const cfg = await getSigmaConfig()
    const cycleBase = Number(cycle_value ?? cfg.cycle.value)
    const cid = cycle_id || `manual-${Date.now()}`

    console.log(`🎯 Iniciando processamento manual de ciclo para ${buyer_id}...`);

    // 1) Registrar evento de ciclo na tabela oficial que dispara o motor
    // Nota: aqui usamos a tabela 'cycle_events' que o listener da API (ou do core) escuta.
    await matrixRepo.registerCycle(buyer_id, 1)
    await supabase.from('cycle_events').insert({
      consultor_id: buyer_id,
      event_type: 'cycle_completed',
      cycle_id: cid,
      event_data: { buyer_id, cycle_value: cycleBase },
      created_at: new Date().toISOString()
    })

    // 2) Distribuir e Persistir Bônus via Motor Unificado (rs-core)
    // Importamos dinamicamente para garantir que pegamos a versão fresca do core
    const { distributeAllBonuses } = require('../../../rs-core/src/math/distributeBonus');

    console.log('📞 Acionando distributeAllBonuses do rs-core...');
    const distributions = await distributeAllBonuses({
      consultor_id: buyer_id,
      cycle_id: cid,
      cycle_value: cycleBase
    });

    res.json({
      success: true,
      message: 'Ciclo processado com sucesso via motor unificado.',
      cycle: { buyer_id, cycle_value: cycleBase, cycle_id: cid },
      distributions
    })
  } catch (e: any) {
    console.error('❌ Erro no processamento de ciclo:', e)
    res.status(500).json({ success: false, error: e.message })
  }
})

export default router
