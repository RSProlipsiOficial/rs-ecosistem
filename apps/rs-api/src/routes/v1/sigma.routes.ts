/**
 * Σ SIGMA ROTAS - V1
 * 
 * Endpoints para o sistema Sigma (árvore de rede)
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAuth } from '../../middlewares/supabaseAuth';
import { getSigmaConfig } from '../../services/sigmaConfigService';
import { collectExistingIdentifiers, normalizeLookupText, persistConsultantIdentifiers, resolveConsultantIdentifiers } from '../../utils/consultantIdentifiers';

const router = express.Router();

type DetailedMappingEntry = {
    code?: string;
    username?: string | null;
    order?: number;
    name?: string;
    email?: string;
    sourceKey?: string;
};

const normalizeBonusType = (value: any) => String(value || '').trim().toLowerCase();
const normalizeAmount = (value: any) => {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
};

const uniqueIds = (values: Array<string | null | undefined>) => (
    [...new Set(values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0))]
);

const detailedMappingCache = (() => {
    const mapping = {
        byCode: new Map<string, DetailedMappingEntry>(),
        byOrder: new Map<string, DetailedMappingEntry>(),
        byName: new Map<string, DetailedMappingEntry>(),
        byEmail: new Map<string, DetailedMappingEntry>(),
        byUsername: new Map<string, DetailedMappingEntry>(),
    };

    const mappingCandidates = [
        path.join(__dirname, 'detailed_id_mapping.json'),
        path.join(process.cwd(), 'src', 'routes', 'v1', 'detailed_id_mapping.json'),
    ];
    const mappingPath = mappingCandidates.find((candidate) => fs.existsSync(candidate));

    if (!mappingPath) {
        return mapping;
    }

    try {
        const rawMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
        for (const [sourceKey, rawEntry] of Object.entries(rawMapping)) {
            const entry = {
                ...(rawEntry as Record<string, any>),
                sourceKey,
            } as DetailedMappingEntry;

            if (entry.code) mapping.byCode.set(String(entry.code).replace(/\D/g, ''), entry);
            if (entry.order !== undefined && entry.order !== null) mapping.byOrder.set(String(entry.order), entry);
            if (entry.name) mapping.byName.set(normalizeLookupText(entry.name), entry);
            if (sourceKey) mapping.byName.set(normalizeLookupText(sourceKey), entry);
            if (entry.email) mapping.byEmail.set(normalizeLookupText(entry.email), entry);
            if (entry.username) mapping.byUsername.set(normalizeLookupText(entry.username), entry);
        }
    } catch (error) {
        console.error('[Sigma] Erro ao ler detailed_id_mapping.json:', error);
    }

    return mapping;
})();

const resolveMappingForConsultor = (consultor: any, profile?: any) => {
    const numericCandidates = [
        profile?.id_numerico,
        consultor?.codigo_consultor,
    ]
        .map((value) => String(value || '').replace(/\D/g, ''))
        .filter(Boolean);

    for (const candidate of numericCandidates) {
        const mappedByCode = detailedMappingCache.byCode.get(candidate);
        if (mappedByCode) return mappedByCode;
        const mappedByOrder = detailedMappingCache.byOrder.get(candidate);
        if (mappedByOrder) return mappedByOrder;
    }

    const emailKey = normalizeLookupText(consultor?.email);
    const usernameKey = normalizeLookupText(consultor?.username);
    const nameKey = normalizeLookupText(consultor?.nome);

    return (
        (emailKey ? detailedMappingCache.byEmail.get(emailKey) : undefined) ||
        (usernameKey ? detailedMappingCache.byUsername.get(usernameKey) : undefined) ||
        (nameKey ? detailedMappingCache.byName.get(nameKey) : undefined) ||
        null
    );
};

const fetchRowsByCandidateIds = async (
    table: string,
    columnNames: string[],
    candidateIds: string[]
) => {
    const rows: any[] = [];
    const seen = new Set<string>();

    for (const columnName of columnNames) {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .in(columnName, candidateIds)
            .order('created_at', { ascending: false });

        if (error || !Array.isArray(data)) {
            continue;
        }

        for (const row of data) {
            const rowKey = `${table}:${String(row?.id ?? `${columnName}:${rows.length}`)}`;
            if (seen.has(rowKey)) {
                continue;
            }

            seen.add(rowKey);
            rows.push(row);
        }
    }

    return rows;
};

// GET /v1/sigma/config
router.get('/config', async (req, res) => {
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

        const consultantId = currentConsultant?.id || authUserId;
        const candidateIds = uniqueIds([authUserId, consultantId]);
        console.log(`[Sigma Bonuses] Fetching for: ${authUserId} -> ${consultantId}`);

        const [walletRows, bonusRows, referralRows] = await Promise.all([
            fetchRowsByCandidateIds('wallet_transactions', ['consultant_id', 'user_id'], candidateIds),
            fetchRowsByCandidateIds('bonuses', ['consultor_id', 'user_id'], candidateIds),
            fetchRowsByCandidateIds('order_referrals', ['referrer_id'], candidateIds)
        ]);

        const walletEntries = (walletRows || [])
            .map((tx: any) => {
                const rawType = normalizeBonusType(tx.type || tx.reference_type);
                return {
                    id: `wallet:${tx.id}`,
                    date: new Date(tx.created_at).toLocaleDateString('pt-BR'),
                    rawTypes: [rawType].filter(Boolean),
                    rawType,
                    type: tx.details?.bonusType || tx.type || 'bonus',
                    source: tx.details?.sourceUser?.name || 'Sistema',
                    status: tx.status === 'completed' ? 'pago' : 'pendente',
                    amount: normalizeAmount(tx.amount)
                };
            })
            .filter((entry) => entry.rawType);

        const legacyBonusEntries = (bonusRows || [])
            .map((bonus: any) => {
                const rawTypes = uniqueIds([
                    normalizeBonusType(bonus.tipo),
                    normalizeBonusType(bonus.subtipo),
                    normalizeBonusType(bonus.bonus_type)
                ]);

                return {
                    id: `bonus:${bonus.id}`,
                    date: new Date(bonus.data_pagamento || bonus.created_at || Date.now()).toLocaleDateString('pt-BR'),
                    rawTypes,
                    rawType: rawTypes[0] || 'bonus',
                    type: bonus.descricao || bonus.description || bonus.subtipo || bonus.tipo || bonus.bonus_type || 'bonus',
                    source: bonus.gerado_por_consultor_id ? 'Rede' : 'Sistema',
                    status: normalizeBonusType(bonus.status) === 'pago' ? 'pago' : 'pendente',
                    amount: normalizeAmount(bonus.valor ?? bonus.amount)
                };
            })
            .filter((entry) => entry.rawTypes.length > 0);

        const referralEntries = (referralRows || [])
            .map((referral: any) => ({
                id: `referral:${referral.id}`,
                date: new Date(referral.created_at || Date.now()).toLocaleDateString('pt-BR'),
                rawTypes: ['affiliate_referral'],
                rawType: 'affiliate_referral',
                type: referral.bonus_type || 'Comissao de afiliado',
                source: 'Marketplace',
                status: 'pago',
                amount: normalizeAmount(referral.commission_amount)
            }))
            .filter((entry) => entry.amount > 0);

        const normalizedBonuses = [
            ...walletEntries,
            ...legacyBonusEntries,
            ...referralEntries
        ];

        const cycleTypes = new Set(['bonus_global', 'commission_cycle', 'cycle', 'ciclo']);
        const topSigmeTypes = new Set(['bonus_sigme', 'bonus_match', 'bonus_level', 'bonus_fidelity', 'sigme', 'top_sigme', 'topsigme']);
        const matrixDepthTypes = new Set(['depth_bonus', 'matriz', 'profundidade']);
        const careerTypes = new Set(['bonus_career', 'bonus_compensation', 'career', 'compensation', 'carreira']);
        const affiliateTypes = new Set(['bonus_start', 'direct_sale', 'affiliate_referral', 'afiliado', 'affiliate']);
        const walletAffiliateFallbackTypes = new Set(['sale']);
        const dropshipTypes = new Set(['dropship', 'bonus_dropship', 'dropship_bonus']);
        const logisticsTypes = new Set(['logistica', 'logistics', 'bonus_logistica', 'bonus_logistics', 'frete']);

        const bonusSummary = {
            cycleBonus: 0,
            topSigmeBonus: 0,
            careerPlanBonus: 0,
            affiliateBonus: 0,
            dropshipBonus: 0,
            logisticsBonus: 0,
            total: 0
        };

        let walletAffiliateFallback = 0;

        for (const entry of walletEntries) {
            const amount = entry.amount;
            const rawType = entry.rawType;

            if (cycleTypes.has(rawType)) {
                bonusSummary.cycleBonus += amount;
            } else if (topSigmeTypes.has(rawType)) {
                bonusSummary.topSigmeBonus += amount;
            } else if (careerTypes.has(rawType)) {
                bonusSummary.careerPlanBonus += amount;
            } else if (walletAffiliateFallbackTypes.has(rawType)) {
                walletAffiliateFallback += amount;
            } else if (dropshipTypes.has(rawType)) {
                bonusSummary.dropshipBonus += amount;
            } else if (logisticsTypes.has(rawType)) {
                bonusSummary.logisticsBonus += amount;
            }

            bonusSummary.total += amount;
        }

        for (const entry of legacyBonusEntries) {
            const amount = entry.amount;
            const matches = (types: Set<string>) => entry.rawTypes.some((rawType) => types.has(rawType));

            if (matches(matrixDepthTypes) || matches(topSigmeTypes)) {
                bonusSummary.topSigmeBonus += amount;
            } else if (matches(cycleTypes)) {
                bonusSummary.cycleBonus += amount;
            } else if (matches(careerTypes)) {
                bonusSummary.careerPlanBonus += amount;
            } else if (matches(affiliateTypes)) {
                bonusSummary.affiliateBonus += amount;
            } else if (matches(dropshipTypes)) {
                bonusSummary.dropshipBonus += amount;
            } else if (matches(logisticsTypes)) {
                bonusSummary.logisticsBonus += amount;
            }

            bonusSummary.total += amount;
        }

        for (const entry of referralEntries) {
            bonusSummary.affiliateBonus += entry.amount;
            bonusSummary.total += entry.amount;
        }

        if (bonusSummary.affiliateBonus <= 0 && walletAffiliateFallback > 0) {
            bonusSummary.affiliateBonus = walletAffiliateFallback;
        }

        return res.json({ success: true, data: normalizedBonuses, summary: bonusSummary });

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
            rawType: tx.type,
            type: tx.details?.bonusType || tx.type.replace('bonus_', '').replace('commission_', 'Comissão '),
            source: tx.details?.sourceUser?.name || 'Sistema',
            status: tx.status === 'completed' ? 'pago' : 'pendente',
            amount: tx.amount
        }));

        const summary = (transactions || []).reduce((acc: any, tx: any) => {
            const amount = Number(tx.amount || 0);
            const rawType = String(tx.type || '');

            if (rawType === 'bonus_global' || rawType === 'commission_cycle') {
                acc.cycleBonus += amount;
            } else if (rawType === 'bonus_sigme' || rawType === 'bonus_match' || rawType === 'bonus_level' || rawType === 'bonus_fidelity') {
                acc.topSigmeBonus += amount;
            } else if (rawType === 'bonus_career' || rawType === 'bonus_compensation') {
                acc.careerPlanBonus += amount;
            } else if (rawType === 'bonus_start') {
                acc.affiliateBonus += amount;
            }

            acc.total += amount;
            return acc;
        }, {
            cycleBonus: 0,
            topSigmeBonus: 0,
            careerPlanBonus: 0,
            affiliateBonus: 0,
            dropshipBonus: 0,
            logisticsBonus: 0,
            total: 0
        });

        res.json({ success: true, data: formattedBonuses, summary });

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
            .select('id, email, user_id')
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
	        const { data: allProfiles } = await supabase
	            .from('user_profiles')
	            .select('user_id, id_numerico');
	        const profileMap = new Map<string, any>((allProfiles || []).map((profile) => [profile.user_id, profile]));
            let usedCodes = new Set<string>();
            let usedLogins = new Set<string>();

        // Por padrão, agora usamos a busca recursiva em 'consultores'
        const useRecursiveSearch = true;

        if (useRecursiveSearch) {
            const { data: allConsultants, error: uniError } = await supabase
                .from('consultores')
                .select('id, nome, email, status, pin_atual, created_at, patrocinador_id, user_id')
                .order('created_at', { ascending: true });

            if (uniError) throw uniError;

	            const OFFICIAL_EMAILS = ['rsprolipsioficial@gmail.com', 'robertorjbc@gmail.com'];
	            const userEmail = currentConsultant?.email?.toLowerCase().trim();
	            const isOfficial = OFFICIAL_EMAILS.includes(userEmail || '');

                ({ usedCodes, usedLogins } = collectExistingIdentifiers(allConsultants || [], profileMap));
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

	                    const profile = profileMap.get(c.user_id) || profileMap.get(c.id);
		                    const identifiers = resolveConsultantIdentifiers({
		                        consultor: c,
		                        profile,
		                        mapping: resolveMappingForConsultor(c, profile),
		                        usedCodes,
		                        usedLogins,
		                    });
                            void persistConsultantIdentifiers({
                                supabase,
                                consultor: c,
                                profile,
                                identifiers,
                            }).catch(() => undefined);

	                    descendants.push({
	                        id: c.id,
	                        displayId: identifiers.displayId,
	                        code: identifiers.accountCode,
	                        idConsultor: identifiers.loginId,
                            login: identifiers.loginId,
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

	                const profile = profileMap.get(c.user_id) || profileMap.get(c.id);
	                    const identifiers = resolveConsultantIdentifiers({
	                        consultor: c,
	                        profile,
	                        mapping: resolveMappingForConsultor(c, profile),
	                        usedCodes,
	                        usedLogins,
	                    });
                        void persistConsultantIdentifiers({
                            supabase,
                            consultor: c,
                            profile,
                            identifiers,
                        }).catch(() => undefined);

	                return {
	                    id: c.id,
	                    displayId: identifiers.displayId,
	                    code: identifiers.accountCode,
	                    idConsultor: identifiers.loginId,
                        login: identifiers.loginId,
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
            .select('id, user_id, nome, username, pin_atual, status, email, whatsapp')
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

	        const { data: allProfiles } = await supabase
	            .from('user_profiles')
	            .select('user_id, id_numerico');
	        const profileMap = new Map<string, any>((allProfiles || []).map((profile) => [profile.user_id, profile]));
            const { usedCodes, usedLogins } = collectExistingIdentifiers(allConsultants || [], profileMap);

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

	                const profile = profileMap.get(c.user_id) || profileMap.get(c.id);
	                    const identifiers = resolveConsultantIdentifiers({
	                        consultor: c,
	                        profile,
	                        mapping: resolveMappingForConsultor(c, profile),
	                        usedCodes,
	                        usedLogins,
	                    });
                        void persistConsultantIdentifiers({
                            supabase,
                            consultor: c,
                            profile,
                            identifiers,
                        }).catch(() => undefined);

	                return {
	                    id: c.id,
	                    displayId: identifiers.displayId,
	                    code: identifiers.accountCode,
	                    idConsultor: identifiers.loginId,
	                    name: c.nome,
	                    login: identifiers.loginId,
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

	        const rootProfile = profileMap.get((userNode as any).user_id) || profileMap.get(userNode.id);
	            const rootIdentifiers = resolveConsultantIdentifiers({
	                consultor: userNode,
	                profile: rootProfile,
	                mapping: resolveMappingForConsultor(userNode, rootProfile),
	                usedCodes,
	                usedLogins,
	            });
                void persistConsultantIdentifiers({
                    supabase,
                    consultor: userNode,
                    profile: rootProfile,
                    identifiers: rootIdentifiers,
                }).catch(() => undefined);
	        const rootNode: any = {
	            id: userNode.id,
	            displayId: rootIdentifiers.displayId,
	            code: rootIdentifiers.accountCode,
	            idConsultor: rootIdentifiers.loginId,
	            name: userNode.nome,
	            login: rootIdentifiers.loginId,
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
