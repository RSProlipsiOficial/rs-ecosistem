/**
 * ⚙️ OPS ROTAS - V1
 * 
 * Endpoints para operações globais do sistema (Sincronização, Recálculo, Rankings)
 */

import express from 'express';
import { supabaseAuth, requireRole, ROLES } from '../../middlewares/supabaseAuth';
import { recalcBonuses, updateRanks } from '../../../../../ops/scripts/rs-ops/src/index';

const router = express.Router();

// POST /v1/ops/sync-network
// Gatilha a atualização de rankings e estrutura de rede
router.post('/sync-network', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.MASTER]), async (req, res) => {
    try {
        console.log('🚀 [OPS] Iniciando sincronização de rede...');

        // Executa o job de atualização de ranks do rs-ops
        await updateRanks();

        res.json({
            success: true,
            message: 'Sincronização de rede iniciada com sucesso',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('❌ [OPS] Erro na sincronização de rede:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /v1/ops/recalc-bonuses
// Gatilha o recálculo de bônus para o período
router.post('/recalc-bonuses', supabaseAuth, requireRole([ROLES.ADMIN, ROLES.MASTER]), async (req, res) => {
    try {
        const { period = 'daily' } = req.body;
        console.log(`🚀 [OPS] Iniciando recálculo de bônus (${period})...`);

        // Executa o job de recálculo de bônus do rs-ops
        await recalcBonuses(period);

        res.json({
            success: true,
            message: `Recálculo de bônus (${period}) iniciado com sucesso`,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('❌ [OPS] Erro no recálculo de bônus:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
