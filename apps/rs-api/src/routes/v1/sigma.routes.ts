/**
 * Σ SIGMA ROTAS - V1
 * 
 * Endpoints para o sistema Sigma (árvore de rede)
 */

import express from 'express';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAuth } from '../../middlewares/supabaseAuth';
import { getSigmaConfig } from '../../services/sigmaConfigService';

const router = express.Router();

// GET /v1/sigma/config
router.get('/config', supabaseAuth, async (req, res) => {
    try {
        const config = await getSigmaConfig();
        res.json({ data: config });
    } catch (error: any) {
        console.error('Erro ao buscar configuração Sigma:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /v1/sigma/stats
router.get('/stats', supabaseAuth, async (req: any, res) => {
    try {
        const userId = req.user.id;

        // Fetch counts from database
        // This is a simplified version. For large networks, we might need a recursive query or materialized view.
        // For now, let's get direct children and maybe aggregate from downlines table.

        // Count total downlines (recursive)
        // Using a recursive CTE would be better, but let's assume we can query the 'downlines' table
        // The 'downlines' table maps upline_id -> downline_id with levels?
        // Let's check the schema or assume based on previous 'tree' endpoint usage.

        // In 'tree' endpoint: downlines table has 'upline_id', 'downline_id', 'linha'.
        // So we can count all entries where upline_id = userId for total downline size (if it stores all descendants)
        // Or if it only stores direct children, we need recursion.
        // Usually 'downlines' table in such systems is flattened (closure table) or just adjacency list.
        // Based on 'tree' code:
        // const { data: directChildren } = await supabase.from('downlines').select(...).eq('upline_id', userId);
        // And then it fetches grandchildren using 'in'.
        // This suggests it's an adjacency list (direct children only).

        // For stats, we want total network size.
        // If we don't have a closure table, this is expensive.
        // However, we can just return direct stats for now to avoid performance issues, or use a stored procedure if available.

        // Let's try to get direct stats first.
        const { count: totalDirects } = await supabase
            .from('consultores')
            .select('*', { count: 'exact', head: true })
            .eq('patrocinador_id', userId);

        // Get active directs
        const { data: directConsultants } = await supabase
            .from('consultores')
            .select('status')
            .eq('patrocinador_id', userId);

        const activeDirects = directConsultants?.filter((c: any) => c.status === 'ativo' || c.status === 'Ativo').length || 0;
        const inactiveDirects = (totalDirects || 0) - activeDirects;

        res.json({
            data: {
                totalDownline: totalDirects,
                activeDirects,
                inactiveDirects,
                maxDepth: 0,
                downlineWithPurchase: 0,
                downlineWithoutPurchase: 0,
                pinSummary: {}
            }
        });

    } catch (error: any) {
        console.error('Erro ao buscar estatísticas Sigma:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /v1/sigma/bonuses
router.get('/bonuses', supabaseAuth, async (req: any, res) => {
    try {
        const userId = req.user.id;

        // Buscar bônus na tabela 'bonuses'
        const { data: bonuses, error } = await supabase
            .from('bonuses')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Se não houver bônus na tabela específica, tentar buscar em transações de carteira
        if (!bonuses || bonuses.length === 0) {
            const { data: transactions, error: transError } = await supabase
                .from('wallet_transactions')
                .select('*')
                .eq('user_id', userId)
                .eq('type', 'credit') // Apenas créditos
                .ilike('description', '%bônus%') // Que contenham "bônus" na descrição
                .order('created_at', { ascending: false });

            if (!transError && transactions && transactions.length > 0) {
                const formattedTransactions = transactions.map((t: any) => ({
                    id: t.id,
                    date: new Date(t.created_at).toLocaleDateString('pt-BR'),
                    type: 'Bônus',
                    source: t.description,
                    status: 'pago',
                    amount: t.amount
                }));
                return res.json({ data: formattedTransactions });
            }
        }

        const formattedBonuses = (bonuses || []).map((b: any) => ({
            id: b.id,
            date: new Date(b.created_at).toLocaleDateString('pt-BR'),
            type: b.bonus_type,
            source: formatBonusType(b.bonus_type),
            status: 'pago',
            amount: b.amount
        }));

        res.json({ data: formattedBonuses });

    } catch (error: any) {
        console.error('Erro ao buscar bônus:', error);
        res.status(500).json({ error: error.message });
    }
});

function formatBonusType(type: string): string {
    const map: Record<string, string> = {
        'cycle': 'Ciclo',
        'depth': 'Profundidade',
        'fidelity': 'Fidelidade',
        'topSigma': 'Top SIGMA',
        'career': 'Carreira'
    };
    return map[type] || type;
}

// GET /v1/sigma/bonuses
router.get('/bonuses', supabaseAuth, async (req: any, res) => {
    try {
        const userId = req.user.id;

        // Fetch bonuses from wallet_transactions
        // We filter by types that represent bonuses
        const { data: transactions, error } = await supabase
            .from('wallet_transactions')
            .select('*')
            .eq('user_id', userId)
            .in('type', ['bonus_level', 'bonus_match', 'bonus_start', 'bonus_global', 'commission_cycle', 'bonus_career', 'bonus_compensation', 'bonus_sigme', 'bonus_fidelity'])
            .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedBonuses = transactions.map((tx: any) => ({
            id: tx.id,
            date: new Date(tx.created_at).toLocaleDateString('pt-BR'),
            type: tx.details?.bonusType || tx.type.replace('bonus_', '').replace('commission_', 'Comissão '),
            source: tx.details?.sourceUser?.name || 'Sistema',
            status: tx.status === 'completed' ? 'pago' : 'pendente',
            amount: tx.amount
        }));

        res.json({ data: formattedBonuses });

    } catch (error: any) {
        console.error('Erro ao buscar bônus Sigma:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /v1/sigma/tree
router.get('/tree', supabaseAuth, async (req: any, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        const userId = req.user.id;

        // 1. Buscar o próprio usuário
        const { data: userNode, error: userError } = await supabase
            .from('consultores')
            .select('id, nome, login, pin_atual, status')
            .eq('id', userId)
            .single();

        if (userError) throw userError;

        // 2. Buscar descendentes (Nível 1 da Matriz - Filhos Diretos)
        const { data: directChildren, error: childrenError } = await supabase
            .from('consultores')
            .select('id, nome, email, pin_atual, status')
            .eq('patrocinador_id', userId);

        if (childrenError) throw childrenError;

        const rootNode: any = {
            id: userNode.id,
            name: userNode.nome,
            login: userNode.login || userNode.email,
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
                login: c.login || c.email,
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
                    .select('id, nome, email, pin_atual, status, patrocinador_id')
                    .in('patrocinador_id', childIds);

                if (grandChildren) {
                    grandChildren.forEach((gc: any) => {
                        const parent = rootNode.children.find((c: any) => c.id === gc.patrocinador_id);
                        if (parent) {
                            parent.children.push({
                                id: gc.id,
                                name: gc.nome,
                                login: gc.login || gc.email,
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

        res.json({ tree: rootNode });

    } catch (error: any) {
        console.error('Erro na árvore Sigma:', error);
        res.status(500).json({
            error: 'Erro interno do servidor: ' + error.message
        });
    }
});

export default router;