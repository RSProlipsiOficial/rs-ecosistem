/**
 * 🏆 ROTAS DE CARREIRA - V1
 * 
 * Endpoints para o Plano de Carreira (SIGME e Digital)
 */

import express from 'express';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAuth, AuthenticatedRequest } from '../../middlewares/supabaseAuth';

const router = express.Router();

// GET /v1/career/digital-levels
// Retorna os níveis configurados pelo administrador
router.get('/digital-levels', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('career_levels_digital')
            .select('*')
            .eq('active', true)
            .order('display_order', { ascending: true });

        if (error) throw error;

        // Mapear campos para o padrão do frontend (imageUrl)
        const formattedLevels = (data || []).map(level => ({
            ...level,
            requiredVolume: level.required_volume,
            imageUrl: level.pin_image,
            displayOrder: level.display_order
        }));

        res.json({
            success: true,
            data: formattedLevels
        });
    } catch (error: any) {
        console.error('Erro ao buscar níveis de carreira digital:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /v1/career/digital-stats
// Retorna o volume atual e progresso do consultor logado
router.get('/digital-stats', supabaseAuth, async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        // 1. Buscar volume real do consultor na tabela de performance ou sales
        // Para simplificar agora, buscamos da consultant_performance se existir
        const { data: perf } = await supabase
            .from('consultant_performance')
            .select('points, current_rank_digital')
            .eq('consultant_id', userId)
            .single();

        // 2. Buscar níveis para calcular próximo PIN
        const { data: levels } = await supabase
            .from('career_levels_digital')
            .select('name, required_volume')
            .eq('active', true)
            .order('required_volume', { ascending: true });

        const currentVolume = perf?.points || 0;
        let currentPin = perf?.current_rank_digital || 'Consultor';
        let nextPin = 'RS One Star';
        let nextLevelVolume = 10000;

        if (levels && levels.length > 0) {
            const nextLevel = levels.find(l => l.required_volume > currentVolume);
            if (nextLevel) {
                nextPin = nextLevel.name;
                nextLevelVolume = nextLevel.required_volume;
            } else {
                // Se já bateu o último nível
                nextPin = 'MAX';
                nextLevelVolume = levels[levels.length - 1].required_volume;
            }
        }

        const progressPercentage = nextLevelVolume > 0
            ? Math.min((currentVolume / nextLevelVolume) * 100, 100)
            : 0;

        res.json({
            success: true,
            data: {
                currentVolume,
                nextLevelVolume,
                currentPin,
                nextPin,
                progressPercentage
            }
        });
    } catch (error: any) {
        console.error('Erro ao buscar estatísticas de carreira digital:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
