import { Router } from 'express';
import { supabaseAdmin } from '../../lib/supabaseClient';
import { requireRole, ROLES, supabaseAuth } from '../../middlewares/supabaseAuth';

const router = Router();

// GET /v1/reports/performance
router.get('/performance', supabaseAuth, async (req, res) => {
    try {
        const { consultantId } = req.query;
        if (!consultantId) {
            return res.status(400).json({ success: false, error: 'consultantId é obrigatório' });
        }

        // 1. Buscar dados do consultor
        const { data: consultant, error: cError } = await supabaseAdmin
            .from('consultores')
            .select('*')
            .eq('id', consultantId)
            .maybeSingle();

        if (cError || !consultant) {
            return res.status(404).json({ success: false, error: 'Consultor não encontrado' });
        }

        // 2. Buscar acumuladores (ciclos e pontos)
        const { data: acc } = await supabaseAdmin
            .from('sigma_accumulators')
            .select('*')
            .eq('consultor_id', consultantId)
            .maybeSingle();

        // 3. Buscar diretos para contagem
        const { count: directCount } = await supabaseAdmin
            .from('consultores')
            .select('*', { count: 'exact', head: true })
            .eq('patrocinador_id', consultantId);

        // 4. Montar relatório para o frontend (GoalsAndPerformancePage)
        const report = {
            id: consultant.id,
            currentCycles: acc?.cycles_total || consultant.total_ciclos || 0,
            qualifiedLines: acc?.qualified_lines || 0,
            legContributions: [], // TODO: Buscar se necessário
            downlines: [], // TODO: Buscar se necessário
            sigma: {
                careerPoints: acc?.points_total || 0,
                careerPinCurrent: consultant.pin_atual || 'Iniciante',
                careerPinNext: {
                    name: 'Bronze',
                    pointsRemaining: Math.max(0, 5 - (acc?.cycles_total || 0))
                }
            },
            identity: {
                sigmaActive: consultant.status === 'ativo'
            }
        };

        res.json({ success: true, report });

    } catch (error: any) {
        console.error('Erro ao gerar relatório de performance:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
