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
        const authUserId = req.user.id;

        // 1. Mapear Auth User ID para Consultant ID de forma robusta
        const { data: currentConsultant } = await supabase
            .from('consultores')
            .select('id, email')
            .or(`user_id.eq."${authUserId}",id.eq."${authUserId}"`)
            .maybeSingle();

        if (!currentConsultant) {
            console.warn(`[Sigma Stats] Consultant not found for Auth ID: ${authUserId}`);
            return res.status(404).json({ error: 'Consultor não vinculado' });
        }

        const userId = currentConsultant.id;
        console.log(`[Sigma Stats] Loading for: ${currentConsultant.email} (${userId})`);

        // Fetch counts from database
        // UNIFICAÇÃO POR EMAIL: Consolidar todos os IDs dos emails oficiais
        const OFFICIAL_EMAILS = ['rsprolipsioficial@gmail.com', 'robertorjbc@gmail.com'];

        const userEmail = currentConsultant.email?.toLowerCase().trim();
        const isOfficial = OFFICIAL_EMAILS.includes(userEmail || '');

        let effectiveSponsorIds = [userId];
        if (isOfficial) {
            const { data: officials } = await supabase.from('consultores').select('id').in('email', OFFICIAL_EMAILS);
            effectiveSponsorIds = officials?.map(o => o.id) || [userId];
        }

        const { data: directConsultants } = await supabase
            .from('consultores')
            .select('id, user_id, status')
            .in('patrocinador_id', effectiveSponsorIds);

        // BUSCAR PERFIS PARA FILTRAGEM (Apenas se houver consultores diretos com user_id)
        const userIdsInNetwork = (directConsultants || []).map(c => c.user_id).filter(id => !!id);

        let profiles: any[] = [];
        if (userIdsInNetwork.length > 0) {
            const { data } = await supabase
                .from('user_profiles')
                .select('user_id, mmn_active')
                .in('user_id', userIdsInNetwork);
            profiles = data || [];
        }

        const profileMap = profiles.reduce((acc: any, p: any) => {
            acc[p.user_id] = p;
            return acc;
        }, {});

        const filteredDirects = (directConsultants || []).filter(c => {
            // EXCLUSÃO: Rota Fácil Teste
            if (c.id === '9552d54f-10eb-4d34-86ef-924cd871d4cf' || c.user_id === '9552d54f-10eb-4d34-86ef-924cd871d4cf') return false;

            // FILTRO DE MIGRAÇÃO
            const profile = profileMap[c.user_id || ''];
            if (profile && profile.mmn_active === false) return false;

            return true;
        });

        const totalDirects = filteredDirects.length;
        const activeDirects = filteredDirects.filter((c: any) => c.status === 'ativo' || c.status === 'Ativo').length || 0;
        const inactiveDirects = totalDirects - activeDirects;

        // 2. BUSCAR TODA A REDE RECURSIVA PARA ESTATÍSTICAS REAIS
        const { data: allConsultants } = await supabase
            .from('consultores')
            .select('id, patrocinador_id, pin_atual, status');

        const getAllDescendants = (parentIds: string[]): any[] => {
            const children = (allConsultants || []).filter(c => parentIds.includes(c.patrocinador_id));
            if (children.length === 0) return [];
            return [...children, ...getAllDescendants(children.map(c => c.id))];
        };

        const networkMembers = getAllDescendants(effectiveSponsorIds);
        const pinSummary: Record<string, number> = {};

        // Inicializar com 0 para os PINs principais (Opcional, mas limpo)
        ['Bronze', 'Prata', 'Ouro', 'Safira', 'Esmeralda', 'Diamante'].forEach(p => pinSummary[p] = 0);

        networkMembers.forEach(m => {
            if (m.pin_atual && m.pin_atual !== 'Consultor' && m.pin_atual !== 'Iniciante') {
                pinSummary[m.pin_atual] = (pinSummary[m.pin_atual] || 0) + 1;
            }
        });

        const activeInNetwork = networkMembers.filter(m => m.status === 'ativo' || m.status === 'Ativo').length;

        res.json({
            data: {
                totalDownline: networkMembers.length,
                activeDirects,
                inactiveDirects,
                activeInNetwork,
                maxDepth: 0, // Poderia ser calculado se necessário
                pinSummary
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
        const authUserId = req.user.id;

        // 1. Mapear Auth User ID para Consultant ID de forma robusta
        const { data: currentConsultant } = await supabase
            .from('consultores')
            .select('id')
            .or(`user_id.eq."${authUserId}",id.eq."${authUserId}"`)
            .maybeSingle();

        const userId = currentConsultant?.id || authUserId;
        console.log(`[Sigma Bonuses] Fetching for: ${authUserId} -> ${userId}`);

        // Fetch bonuses from wallet_transactions
        const { data: transactions, error } = await supabase
            .from('wallet_transactions')
            .select('*')
            .eq('user_id', authUserId) // Transações financeiras usam auth user_id
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

// GET /v1/sigma/downlines - Buscar estrutura da rede
router.get('/downlines', supabaseAuth, async (req: any, res) => {
    try {
        const authUserId = req.user.id;

        // 1. Mapear Auth User ID para Consultant ID
        const { data: currentConsultant } = await supabase
            .from('consultores')
            .select('id')
            .eq('user_id', authUserId)
            .single();

        const userId = currentConsultant?.id || authUserId;

        const type = req.query.type as string;

        // Regras de profundidade dinâmica baseadas no tipo de bônus
        let maxDepth = parseInt(req.query.depth as string) || 6;
        if (type === 'sigme') {
            maxDepth = 1; // SIGME (geração 1) é apenas 1ª geração
        } else if (type === 'top-sigme' || type === 'plano-carreira' || type === 'carreira') {
            maxDepth = 99; // Sem limites para Top SIGME e Carreira
        } else if (type === 'fidelidade' || type === 'matriz') {
            maxDepth = 6; // Limite de 6 níveis
        }

        let formattedDownlines: any[] = [];

        // Por padrão, agora usamos a busca recursiva em 'consultores'
        const useRecursiveSearch = true;

        if (useRecursiveSearch) {
            const { data: allConsultants, error: uniError } = await supabase
                .from('consultores')
                .select('id, nome, email, status, pin_atual, created_at, patrocinador_id, user_id')
                .order('created_at', { ascending: true });

            if (uniError) throw uniError;

            const consultantsInNetwork = allConsultants || [];
            const OFFICIAL_EMAILS = ['rsprolipsioficial@gmail.com', 'robertorjbc@gmail.com'];
            const userEmail = currentConsultant?.email?.toLowerCase().trim();
            const isOfficial = OFFICIAL_EMAILS.includes(userEmail || '');

            const getDescendants = (parentId: string | string[], currentLevel: number): any[] => {
                const parentIds = Array.isArray(parentId) ? parentId : [parentId];
                const children = (allConsultants || []).filter(c => {
                    if (!parentIds.includes(c.patrocinador_id)) return false;
                    if (c.id === '9552d54f-10eb-4d34-86ef-924cd871d4cf' || c.user_id === '9552d54f-10eb-4d34-86ef-924cd871d4cf') return false;
                    return true;
                });
                let descendants: any[] = [];

                children.forEach((c, index) => {
                    const createdAt = new Date(c.created_at);
                    const now = new Date();
                    const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
                    const daysRemaining = Math.max(0, 2 - diffDays);

                    descendants.push({
                        id: c.id,
                        name: c.nome,
                        email: c.email,
                        status: c.status || 'ativo',
                        pin: c.pin_atual || 'Consultor',
                        level: currentLevel,
                        line: index + 1,
                        patrocinador_id: c.patrocinador_id,
                        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.nome)}&background=random`,
                        deadlineLabel: c.status !== 'ativo' ? `${daysRemaining}d para ativar` : undefined
                    });

                    if (currentLevel < maxDepth) {
                        descendants = descendants.concat(getDescendants(c.id, currentLevel + 1));
                    }
                });

                return descendants;
            };

            if (isOfficial) {
                const { data: officials } = await supabase.from('consultores').select('id').in('email', OFFICIAL_EMAILS);
                const officialIds = officials?.map(o => o.id) || [userId];
                formattedDownlines = getDescendants(officialIds, 1);
            } else {
                formattedDownlines = getDescendants(userId, 1);
            }
        } else {
            const { data, error } = await supabase
                .from('downlines')
                .select(`
                    id,
                    level,
                    line,
                    downline:consultores!downline_id (
                        id,
                        nome,
                        email,
                        status,
                        pin_atual,
                        created_at,
                        patrocinador_id
                    )
                `)
                .eq('upline_id', userId)
                .lte('level', maxDepth)
                .order('level', { ascending: true })
                .order('line', { ascending: true });

            if (error) throw error;

            formattedDownlines = (data || []).map((item: any) => {
                const c = item.downline;
                const createdAt = new Date(c.created_at);
                const now = new Date();
                const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
                const daysRemaining = Math.max(0, 2 - diffDays);

                return {
                    id: c.id,
                    name: c.nome,
                    email: c.email,
                    status: c.status || 'ativo',
                    pin: c.pin_atual || 'Consultor',
                    level: item.level,
                    line: item.line,
                    patrocinador_id: c.patrocinador_id,
                    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.nome)}&background=random`,
                    deadlineLabel: c.status !== 'ativo' ? `${daysRemaining}d para ativar` : undefined
                };
            });
        }

        res.json({ data: formattedDownlines });

    } catch (error: any) {
        console.error('Erro ao buscar downlines Sigma:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /v1/sigma/tree
router.get('/tree', supabaseAuth, async (req: any, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        const authUserId = req.user.id;

        // 1. Mapear Auth User ID para Consultant ID de forma robusta
        const { data: currentConsultant } = await supabase
            .from('consultores')
            .select('id, nome, username, pin_atual, status, email, whatsapp')
            .or(`user_id.eq."${authUserId}",id.eq."${authUserId}"`)
            .maybeSingle();

        if (!currentConsultant) throw new Error('Consultor não encontrado na base SIGME');
        const userId = currentConsultant.id;
        const userNode = currentConsultant;
        console.log(`[Sigma Tree] Building for: ${userNode.email}`);

        // 2. Buscar TODOS os consultores para construir a árvore recursiva 
        const { data: allConsultants, error: allErr } = await supabase
            .from('consultores')
            .select('id, nome, email, username, pin_atual, status, patrocinador_id, created_at, user_id, whatsapp')
            .order('created_at', { ascending: true });

        if (allErr) throw allErr;

        const OFFICIAL_EMAILS = ['rsprolipsioficial@gmail.com', 'robertorjbc@gmail.com'];
        const isOfficial = OFFICIAL_EMAILS.includes(userNode.email?.toLowerCase().trim());

        // 3. Buscar ciclos de todos
        const { data: allCycles } = await supabase
            .from('matriz_cycles')
            .select('consultor_id, status')
            .eq('status', 'completed');

        const cycleMap = (allCycles || []).reduce((acc: any, c: any) => {
            acc[c.consultor_id] = (acc[c.consultor_id] || 0) + 1;
            return acc;
        }, {});

        const buildTreeRecursively = (parentId: string | string[], currentLevel: number): { nodes: any[], subTeamCycles: number, subTeamTotal: number } => {
            if (currentLevel > 20) return { nodes: [], subTeamCycles: 0, subTeamTotal: 0 };
            const parentIds = Array.isArray(parentId) ? parentId : [parentId];

            // Sincronização Híbrida de Identidade: Buscar filhos que apontam para UUID OU Username (Short ID)
            // Isso resolve a falha de vínculo onde o app antigo gravou o ID curto no 'patrocinador_id'
            const children = (allConsultants || []).filter(c => {
                const isLinkedByUUID = parentIds.includes(c.patrocinador_id);

                // Buscar Short IDs dos pais atuais (se houver)
                const parentShortIds = (allConsultants || [])
                    .filter(p => parentIds.includes(p.id) && p.username && p.username.length < 36)
                    .map(p => p.username);

                const isLinkedByShortID = parentShortIds.includes(c.patrocinador_id);

                return isLinkedByUUID || isLinkedByShortID;
            });

            let currentLevelTeamCycles = 0;
            let currentLevelTotalNetwork = 0;

            const nodes = children.map(c => {
                const individualCycles = cycleMap[c.id] || 0;
                const { nodes: subNodes, subTeamCycles, subTeamTotal } = buildTreeRecursively(c.id, currentLevel + 1);

                const totalTeamCycles = individualCycles + subTeamCycles;
                const totalNetwork = 1 + subTeamTotal;

                currentLevelTeamCycles += totalTeamCycles;
                currentLevelTotalNetwork += totalNetwork;

                return {
                    id: c.id,
                    name: c.nome,
                    login: c.username || c.email,
                    email: c.email,
                    whatsapp: c.whatsapp,
                    pin: c.pin_atual || 'Consultor',
                    status: c.status,
                    level: currentLevel,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.nome)}&background=random`,
                    directCount: (allConsultants || []).filter(sub => sub.patrocinador_id === c.id).length,
                    individualCycles,
                    teamCycles: totalTeamCycles,
                    totalNetworkCount: totalNetwork,
                    children: subNodes
                };
            });

            return { nodes, subTeamCycles: currentLevelTeamCycles, subTeamTotal: currentLevelTotalNetwork };
        };

        let startIds = [userId];
        if (isOfficial) {
            const { data: officials } = await supabase.from('consultores').select('id').in('email', OFFICIAL_EMAILS);
            startIds = officials?.map(o => o.id) || [userId];
        }

        const { nodes: childrenNodes, subTeamCycles, subTeamTotal } = buildTreeRecursively(startIds, 1);
        const rootIndividualCycles = cycleMap[userNode.id] || 0;

        const rootNode: any = {
            id: userNode.id,
            name: userNode.nome,
            login: userNode.username || userNode.email,
            email: userNode.email,
            whatsapp: (userNode as any).whatsapp,
            pin: userNode.pin_atual || 'Consultor',
            status: userNode.status,
            level: 0,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userNode.nome)}&background=random`,
            directCount: (allConsultants || []).filter(sub => startIds.includes(sub.patrocinador_id)).length,
            individualCycles: rootIndividualCycles,
            teamCycles: rootIndividualCycles + subTeamCycles,
            totalNetworkCount: 1 + subTeamTotal,
            children: childrenNodes
        };

        res.json({ tree: rootNode });

    } catch (error: any) {
        console.error('Erro na árvore Sigma:', error);
        res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
    }
});

// GET /v1/sigma/cycle-journey
router.get('/cycle-journey', supabaseAuth, async (req: any, res) => {
    try {
        const authUserId = req.user.id;
        const { data: currentConsultant } = await supabase
            .from('consultores')
            .select('id')
            .or(`user_id.eq."${authUserId}",id.eq."${authUserId}"`)
            .maybeSingle();

        const userId = currentConsultant?.id || authUserId;
        console.log(`[Sigma Journey] Fetching for: ${userId}`);

        const { data: cycles, error } = await supabase
            .from('matriz_cycles')
            .select('*')
            .eq('consultor_id', userId)
            .order('cycle_number', { ascending: true });

        if (error) throw error;

        const journey = (cycles || []).map(c => ({
            level: c.cycle_number,
            completed: c.status === 'completed' ? 1 : 0,
            bonus: c.cycle_payout || 108.00,
            opened_at: c.opened_at,
            completed_at: c.completed_at
        }));

        res.json({ success: true, data: journey });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /v1/sigma/user-config
router.put('/user-config', supabaseAuth, async (req: any, res) => {
    try {
        const authUserId = req.user.id;
        const { autoReinvest, productId, cdId, shippingMethod = 'pickup' } = req.body;

        await supabase.from('consultores').update({
            mes_referencia: autoReinvest ? `SIGME_AUTO|${productId}|${cdId}|${shippingMethod}` : 'SIGME_MANUAL'
        }).or(`user_id.eq."${authUserId}",id.eq."${authUserId}"`);

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;