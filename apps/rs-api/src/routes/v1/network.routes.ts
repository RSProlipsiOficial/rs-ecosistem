
/**
 * 🕸️ REDE ROTAS - V1
 * 
 * Endpoints para visualização da árvore e estatísticas da rede
 */

import express from 'express';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAuth } from '../../middlewares/supabaseAuth';

const router = express.Router();

// GET /v1/network/tree
router.get('/tree', supabaseAuth, async (req: any, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        const userId = req.user.id;
        const OFFICIAL_EMAIL = 'rsprolipsioficial@gmail.com';

        // Buscar consultor atual para ver o email
        const { data: userData } = await supabase.from('consultores').select('id, email').eq('id', userId).single();
        const userEmail = userData?.email?.toLowerCase().trim();
        const isOfficial = userEmail === OFFICIAL_EMAIL;

        let startIds = [userId];
        if (isOfficial) {
            const { data: officials } = await supabase.from('consultores').select('id').eq('email', OFFICIAL_EMAIL);
            startIds = officials?.map(o => o.id) || [userId];
        }

        // 1. Buscar o próprio usuário (Root da visualização)
        const { data: userNode, error: userError } = await supabase
            .from('consultores')
            .select('id, nome, username, email, pin_atual, status')
            .eq('id', userId)
            .single();

        if (userError) throw userError;

        // 2. Buscar descendentes (Nível 1 da Matriz - Filhos Diretos)
        const { data: directChildren, error: childrenError } = await supabase
            .from('consultores')
            .select('id, nome, email, username, pin_atual, status')
            .in('patrocinador_id', startIds);

        if (childrenError) throw childrenError;

        const rootNode: any = {
            id: userNode.id,
            name: userNode.nome,
            login: userNode.username || userNode.email,
            pin: userNode.pin_atual || 'Iniciante',
            status: userNode.status,
            level: 0,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userNode.nome)}&background=random`,
            children: []
        };

        if (directChildren && directChildren.length > 0) {
            // Mapear filhos diretos
            rootNode.children = directChildren.map((c: any) => ({
                id: c.id,
                name: c.nome,
                login: c.username || c.email,
                pin: c.pin_atual || 'Iniciante',
                status: c.status,
                level: 1,
                avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.nome)}&background=random`,
                children: []
            }));

            // 3. Buscar Netos (Nível 2)
            const childIds = directChildren.map(c => c.id);
            if (childIds.length > 0) {
                const { data: grandChildren } = await supabase
                    .from('consultores')
                    .select('id, nome, email, username, pin_atual, status, patrocinador_id')
                    .in('patrocinador_id', childIds);

                if (grandChildren) {
                    grandChildren.forEach((gc: any) => {
                        const parent = rootNode.children.find((c: any) => c.id === gc.patrocinador_id);
                        if (parent) {
                            parent.children.push({
                                id: gc.id,
                                name: gc.nome,
                                login: gc.username || gc.email,
                                pin: gc.pin_atual || 'Iniciante',
                                status: gc.status,
                                level: 2,
                                avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(gc.nome)}&background=random`,
                                children: []
                            });
                        }
                    });
                }
            }
        }

        // Retornar no formato que a árvore espera
        // O Frontend às vezes espera { tree: ... } ou direto ...
        // Em `sigma.routes.ts` retornava { tree: rootNode }.
        // Vamos manter consistência.
        // Se for root consolidado, o rootNode.id deve ser o do usuário logado, 
        // mas os filhos vêm do ABSOLUTE_ROOT_ID.
        res.json({ tree: rootNode });

    } catch (error: any) {
        console.error('Erro na árvore Network:', error);
        res.status(500).json({
            error: 'Erro interno do servidor: ' + error.message
        });
    }
});

// GET /v1/network/stats
router.get('/stats', supabaseAuth, async (req: any, res) => {
    try {
        const userId = req.user.id;

        // Count direct children
        const { count: directCount, error } = await supabase
            .from('consultores')
            .select('*', { count: 'exact', head: true })
            .eq('patrocinador_id', userId);

        if (error) throw error;

        // Fetch active members count
        const { count: activeCount } = await supabase
            .from('consultores')
            .select('*', { count: 'exact', head: true })
            .eq('patrocinador_id', userId)
            .eq('status', 'ativo');

        res.json({
            totalMembers: directCount || 0,
            activeMembers: activeCount || 0,
            depth: 2 // Hardcoded for simplified view
        });

    } catch (error: any) {
        console.error('Erro nas estats Network:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
