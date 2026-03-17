
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAuth } from '../../middlewares/supabaseAuth';
import { collectExistingIdentifiers, normalizeLookupText, persistConsultantIdentifiers, resolveConsultantIdentifiers } from '../../utils/consultantIdentifiers';

const router = Router();

type DetailedMappingEntry = {
    code?: string;
    username?: string | null;
    order?: number;
    name?: string;
    email?: string;
    sourceKey?: string;
};

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
        console.error('[Matrix] Erro ao ler detailed_id_mapping.json:', error);
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

const generateInitials = (name: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
};

// GET /v1/sigma/matrix/tree/:id
router.get('/tree/:id', supabaseAuth, async (req: any, res) => {
    const { id } = req.params;
    const depth = parseInt(req.query.depth as string) || 3;
    const OFFICIAL_EMAILS = ['rsprolipsioficial@gmail.com'];

    try {
        console.log(`[Matrix] Loading tree for identifier: ${id}`);

        // Blindagem Sênior: Validar se o ID é um UUID para evitar crash de cast no Postgres
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        // 1. Buscar nó raiz com blindagem total
        let query = supabase.from('consultores').select('id, user_id, nome, email, username, pin_atual, status, created_at, whatsapp, patrocinador_id');

        if (isUUID) {
            query = query.or(`id.eq.${id},user_id.eq.${id}`);
        } else {
            // Se não for UUID, busca por campos de texto
            query = query.or(`username.eq.${id},email.eq.${id}`);
        }

        const { data: root, error: rootErr } = await query.maybeSingle();

        if (rootErr) {
            console.error(`[Matrix] Database error fetching root ${id}:`, rootErr);
            return res.status(500).json({ success: false, error: 'Erro de banco de dados ao buscar consultor' });
        }

        if (!root) {
            console.warn(`[Matrix] Consultant not found for ID: ${id}`);
            return res.status(404).json({ success: false, message: 'Consultor não encontrado' });
        }

        console.log(`[Matrix] Found root consultant: ${root.nome} (${root.id})`);

        const isOfficial = OFFICIAL_EMAILS.includes(root.email?.toLowerCase().trim());
        const rootAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(root.nome)}&background=random`;

        // [MEMORY JOIN] Buscar avatares de user_profiles para enriquecer a resposta
        // Como não podemos fazer join direto (tabelas desconexas), buscamos em paralelo
        const { data: profiles } = await supabase
            .from('user_profiles')
            .select('user_id, avatar_url, id_numerico');

        const profileMap = new Map<string, any>();
        if (profiles) {
            profiles.forEach(p => {
                profileMap.set(p.user_id, p);
            });
        }

        // Helper para resolver avatar
        const resolveAvatar = (user: any) => {
            // 1. Tenta pegar do mapa (upload do usuário)
            // O user.id na tabela consultores DEVE bater com o user_id na user_profiles (ou ter um link)
            // Na estrutura atual, consultores.id é o UUID do usuário no Auth? Ou é consultores.user_id?
            // Vamos tentar buscar por ambos para garantir

            const customAvatar = profileMap.get(user.user_id)?.avatar_url || profileMap.get(user.id)?.avatar_url;
            if (customAvatar) return customAvatar;

            // 2. Fallback UI Avatars
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome)}&background=random`;
        };

        const resolveProfile = (user: any) =>
            profileMap.get(user?.user_id) || profileMap.get(user?.id) || null;

        // [UNIFIED LOGIC] 
        // Logic for 'Official' accounts removed to ensure ALL accounts use the new 
        // Balanced BFS Spillover logic (buildMatrixIterative).
        // Previous logic was bypassing the fix and causing data loss (dropping excess children).

        console.log(`[Matrix] Building dynamic hybrid tree for ${root.id} (Unified Path)...`);

        // 1. Buscar TODOS os consultores para montar a rede
        // [FIX] Não filtrar por data pois datas podem ser mockadas/inconsistentes
        // A exclusão de uplines é feita pela função isInUplineChain() abaixo
        let consultQuery = supabase
            .from('consultores')
            .select('id, user_id, nome, username, pin_atual, status, created_at, patrocinador_id, whatsapp, email, cpf');

        // [FIX] Só excluir o patrocinador do root se ele existir (raiz da rede não tem patrocinador)
        if (root.patrocinador_id) {
            consultQuery = consultQuery.neq('id', root.patrocinador_id);
        }

        const { data: allConsultants } = await consultQuery
            .order('created_at', { ascending: true });
        const { usedCodes, usedLogins } = collectExistingIdentifiers(allConsultants || [], profileMap);

        console.log(`[Matrix] Root patrocinador_id: ${root.patrocinador_id}`);
        console.log(`[Matrix] Total consultants loaded: ${allConsultants?.length || 0}`);

        // --- NOVO: BUSCAR PEDIDOS DO MÊS ATUAL PARA DEFINIR STATUS REAL MMN (UNIFICADO) ---
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // A. Pedidos Sede
        const { data: monthlyOrders } = await supabase
            .from('orders')
            .select('buyer_id, matrix_accumulated, total, payment_date, created_at')
            .in('payment_status', ['approved', 'paid', 'Pago'])
            .in('status', ['paid', 'processing', 'delivered', 'in_transit', 'shipped']);

        const activeInMonth = new Set<string>();
        const monthlyAccMap = new Map<string, number>();

        monthlyOrders?.forEach(o => {
            const orderDate = new Date(o.payment_date || o.created_at);
            if (orderDate >= startOfMonth) {
                const current = monthlyAccMap.get(o.buyer_id) || 0;
                const value = Number(o.matrix_accumulated || 0) > 0 
                    ? Number(o.matrix_accumulated) 
                    : Number(o.total || 0);
                const newVal = current + value;
                monthlyAccMap.set(o.buyer_id, newVal);
                if (newVal >= 60) activeInMonth.add(o.buyer_id);
            }
        });

        // B. Pedidos Multi-CD
        const emailToId = new Map<string, string>();
        const cpfToId = new Map<string, string>();
        allConsultants?.forEach(c => {
            if (c.email) emailToId.set(c.email.toLowerCase().trim(), c.id);
            if (c.cpf) cpfToId.set(c.cpf.replace(/\D/g, ''), c.id);
        });

        const { data: cdOrders } = await supabase
            .from('cd_orders')
            .select('total, created_at, buyer_email, buyer_cpf, order_date')
            .in('status', ['ENTREGUE', 'EM_TRANSPORTE', 'PAGO', 'paid', 'delivered', 'in_transit', 'shipped'])
            .is('marketplace_order_id', null);

        cdOrders?.forEach(o => {
            const orderDate = new Date(o.order_date || o.created_at);
            if (orderDate >= startOfMonth) {
                const bId = (o.buyer_email ? emailToId.get(o.buyer_email.toLowerCase().trim()) : null) || 
                            (o.buyer_cpf ? cpfToId.get(o.buyer_cpf.replace(/\D/g, '')) : null);
                if (bId) {
                    const current = monthlyAccMap.get(bId) || 0;
                    const newVal = current + Number(o.total || 0);
                    monthlyAccMap.set(bId, newVal);
                    if (newVal >= 60) activeInMonth.add(bId);
                }
            }
        });

        // [RS-SPILLOVER-FIX] Construção de Matriz com Derramamento Real (BFS Iterativo)
        // Lógica: Preenche slots vazios sequencialmente (Esquerda -> Direita)
        const buildMatrixIterative = (rootNodeData: any, depthLimit: number) => {
            const consultants = allConsultants || [];

            // [UPLINE EXCLUSION HELPER] Função para verificar se uma pessoa está na cadeia ascendente
            const isInUplineChain = (personId: string, personUsername: string | null): boolean => {
                // Começar do root e subir recursivamente até não ter mais patrocinador
                let currentPatrocinadorId = rootNodeData.patrocinador_id;

                // Buscar até 20 níveis acima (segurança contra loop infinito)
                for (let i = 0; i < 20; i++) {
                    if (!currentPatrocinadorId) break; // Chegou no topo

                    // Se esta pessoa é o patrocinador atual na cadeia, é upline!
                    if (personId === currentPatrocinadorId || personUsername === currentPatrocinadorId) {
                        return true;
                    }

                    // Subir um nível: buscar o patrocinador deste patrocinador
                    const uplineConsultant = consultants.find(c =>
                        c.id === currentPatrocinadorId || c.username === currentPatrocinadorId
                    );

                    if (!uplineConsultant) break; // Não encontrou, parar

                    currentPatrocinadorId = uplineConsultant.patrocinador_id; // Subir mais um nível
                }

                return false;
            };

            // Mapa de nós montados
            const treeMap = new Map<string, any>();

            // Inicializando Root
            const rootProfile = resolveProfile(rootNodeData);
            const rootIdentifiers = resolveConsultantIdentifiers({
                consultor: rootNodeData,
                profile: rootProfile,
                mapping: resolveMappingForConsultor(rootNodeData, rootProfile),
                usedCodes,
                usedLogins,
            });
            void persistConsultantIdentifiers({
                supabase,
                consultor: rootNodeData,
                profile: rootProfile,
                identifiers: rootIdentifiers,
            }).catch(() => undefined);
            
            const isMonthlyActiveRoot = (monthlyAccMap.get(rootNodeData.id) || 0) >= 60;
            const rootNode = {
                id: rootNodeData.id,
                displayId: rootIdentifiers.displayId,
                code: rootIdentifiers.accountCode,
                idConsultor: rootIdentifiers.loginId,
                name: rootNodeData.nome,
                pin: rootNodeData.pin_atual || 'Iniciante',
                status: isMonthlyActiveRoot ? 'active' : 'inactive',
                hasPurchased: (monthlyAccMap.get(rootNodeData.id) || 0) > 0,
                level: 0,
                avatarUrl: resolveAvatar(rootNodeData),
                joinedDate: rootNodeData.created_at,
                whatsapp: rootNodeData.whatsapp, // [FIX] Preserving WhatsApp
                email: rootNodeData.email,       // [FIX] Preserving Email
                username: rootNodeData.username || rootIdentifiers.loginId, // [FIX] Preserving Username for linkage
                isEmpty: false,
                children: [] as any[]
            };
            treeMap.set(rootNode.id, rootNode);

            // Filtro de Segurança: Apenas quem nasceu DEPOIS do root ou é descendente
            // Como a lista já vem ordenada por data, começamos a iterar.
            // Para "Encontrar" o lugar de alguém, o patrocinador DEVE estar na árvore.

            consultants.forEach(person => {
                // Pular o próprio root se ele vier na lista
                if (person.id === rootNode.id) return;

                // [UPLINE EXCLUSION] Verificar se esta pessoa está na cadeia ascendente do root
                // Exemplo: Rota Fácil → ... → Emanuel (root)
                // Qualquer pessoa nesta cadeia NÃO pode ser filho do root!
                const isUpline = isInUplineChain(person.id, person.username);

                // [DEBUG] Log específico para Rota Fácil
                if (person.nome?.toLowerCase().includes('rota') && person.nome?.toLowerCase().includes('fácil')) {
                    console.log(`[DEBUG] Rota Fácil detectado!`);
                    console.log(`  ID: ${person.id}`);
                    console.log(`  Nome: ${person.nome}`);
                    console.log(`  Patrocinador ID: ${person.patrocinador_id}`);
                    console.log(`  Root Patrocinador ID: ${rootNodeData.patrocinador_id}`);
                    console.log(`  isUpline: ${isUpline}`);
                }

                if (isUpline) {
                    // Esta pessoa é upline (patrocinador, avô, bisavô, etc), não pode ser filho!
                    if (person.nome?.toLowerCase().includes('rota')) {
                        console.log(`  ✅ Rota Fácil EXCLUÍDO (upline detection worked!)`);
                    }
                    return;
                }

                // Tentar encontrar o patrocinador na árvore montada
                // Aceita UUID ou username (short ID)
                let sponsorNode = treeMap.get(person.patrocinador_id);

                if (!sponsorNode) {
                    // Fallback: Tentar achar pelo short ID (username)
                    // Isso requer varrer o map ou ter um map secundário de username -> Node.
                    // Para performance, vamos varrer apenas se necessário (ou confiar no ID)
                    // Dado que o banco guarda UUID no patrocinador_id na maioria das vezes, OK.
                    // Mas sistemas híbridos podem usar username.
                    for (const node of treeMap.values()) {
                        if ((node as any).username === person.patrocinador_id) {
                            sponsorNode = node;
                            break;
                        }
                    }
                }

                // Se o patrocinador está na árvore (faz parte da rede do Root), alocamos a pessoa.
                if (sponsorNode) {
                    // BFS para encontrar o primeiro slot vago abaixo do Patrocinador
                    // Fila de nós a visitar
                    // BFS para encontrar o slot vago ideal (Balanceado: Menos filhos primeiro)
                    // Fila começa com o Patrocinador
                    let currentLevelNodes = [sponsorNode];
                    let placed = false;

                    // Enquanto não alocamos e ainda temos níveis para descer
                    while (currentLevelNodes.length > 0 && !placed) {

                        // 1. Filtrar candidatos neste nível que têm vaga (< 6 filhos)
                        const candidates = currentLevelNodes.filter(node => node.children.length < 6);

                        if (candidates.length > 0) {
                            // 2. Ordenar candidatos para garantir balanceamento (Round Robin / Esquerda->Direita)
                            // Critério 1: Menor número de filhos (prioriza quem tem 0, depois 1, etc.)
                            candidates.sort((a, b) => a.children.length - b.children.length);

                            const bestParent = candidates[0];

                            const personProfile = resolveProfile(person);
                            const personIdentifiers = resolveConsultantIdentifiers({
                                consultor: person,
                                profile: personProfile,
                                mapping: resolveMappingForConsultor(person, personProfile),
                                usedCodes,
                                usedLogins,
                            });
                            void persistConsultantIdentifiers({
                                supabase,
                                consultor: person,
                                profile: personProfile,
                                identifiers: personIdentifiers,
                            }).catch(() => undefined);
                            
                            const isMonthlyActivePerson = (monthlyAccMap.get(person.id) || 0) >= 60;
                            const newNode = {
                                id: person.id,
                                displayId: personIdentifiers.displayId,
                                code: personIdentifiers.accountCode,
                                idConsultor: personIdentifiers.loginId,
                                name: person.nome,
                                pin: person.pin_atual || 'Iniciante',
                                status: isMonthlyActivePerson ? 'active' : 'inactive',
                                hasPurchased: (monthlyAccMap.get(person.id) || 0) > 0,
                                level: bestParent.level + 1,
                                position: bestParent.children.length + 1,
                                avatarUrl: resolveAvatar(person),
                                joinedDate: person.created_at,
                                whatsapp: person.whatsapp,
                                email: person.email,
                                username: person.username || personIdentifiers.loginId,
                                isEmpty: false,
                                children: [] as any[]
                            };

                            bestParent.children.push(newNode);
                            treeMap.set(person.id, newNode);
                            placed = true;
                        } else {
                            // 3. Se ninguém neste nível tem vaga, descer para o próximo nível
                            const nextLevelNodes = [];
                            for (const node of currentLevelNodes) {
                                nextLevelNodes.push(...node.children);
                            }
                            currentLevelNodes = nextLevelNodes;
                        }
                    }
                }
                // Se patrocinador não está na árvore, ignoramos (é crossline ou upline do root).
            });

            // Pós-processamento: Cortar profundidade e preencher vazios visuais
            const trimAndFill = (node: any, currentDepth: number): any => {
                if (currentDepth > depthLimit) return null; // Corte de profundidade

                // Preencher vazios para visualização 6x6
                const visualChildren = [];
                for (let i = 0; i < 6; i++) {
                    if (i < node.children.length) {
                        // Recursão para filhos reais
                        const processedChild = trimAndFill(node.children[i], currentDepth + 1);
                        if (processedChild) visualChildren.push(processedChild);
                    } else {
                        // Slot Vazio
                        visualChildren.push({
                            id: `empty-${node.id}-${i + 1}`,
                            isEmpty: true,
                            position: i + 1,
                            level: currentDepth + 1,
                            children: []
                        });
                    }
                }

                // Substituir filhos reais pela lista visual completa
                node.children = visualChildren;
                return node;
            };

            return trimAndFill(rootNode, 0); // Start at level 0, fill up to depth
        };

        const tree = buildMatrixIterative(root, depth);

        res.json({ success: true, tree });

    } catch (error: any) {
        console.error('Erro ao gerar árvore da matriz:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
