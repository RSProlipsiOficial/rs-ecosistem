
import { Router } from 'express';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAuth } from '../../middlewares/supabaseAuth';

const router = Router();

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
        let query = supabase.from('consultores').select('id, nome, email, username, pin_atual, status, created_at, whatsapp, patrocinador_id');

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
            .select('user_id, avatar_url');

        const avatarMap = new Map<string, string>();
        if (profiles) {
            profiles.forEach(p => {
                if (p.avatar_url) avatarMap.set(p.user_id, p.avatar_url);
            });
        }

        // Helper para resolver avatar
        const resolveAvatar = (user: any) => {
            // 1. Tenta pegar do mapa (upload do usuário)
            // O user.id na tabela consultores DEVE bater com o user_id na user_profiles (ou ter um link)
            // Na estrutura atual, consultores.id é o UUID do usuário no Auth? Ou é consultores.user_id?
            // Vamos tentar buscar por ambos para garantir

            const customAvatar = avatarMap.get(user.user_id) || avatarMap.get(user.id);
            if (customAvatar) return customAvatar;

            // 2. Fallback UI Avatars
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome)}&background=random`;
        };

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
            .select('id, user_id, nome, username, pin_atual, status, created_at, patrocinador_id, whatsapp, email');

        // [FIX] Só excluir o patrocinador do root se ele existir (raiz da rede não tem patrocinador)
        // Antes: .neq('id', root.patrocinador_id || 'NONE') causava erro UUID no Postgres quando null
        if (root.patrocinador_id) {
            consultQuery = consultQuery.neq('id', root.patrocinador_id);
        }

        const { data: allConsultants } = await consultQuery
            .order('created_at', { ascending: true });

        console.log(`[Matrix] Root patrocinador_id: ${root.patrocinador_id}`);
        console.log(`[Matrix] Total consultants loaded: ${allConsultants?.length || 0}`);

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
            const rootNode = {
                id: rootNodeData.id,
                name: rootNodeData.nome,
                pin: rootNodeData.pin_atual || 'Iniciante',
                status: rootNodeData.status === 'ativo' ? 'active' : 'inactive',
                level: 0,
                avatarUrl: resolveAvatar(rootNodeData),
                joinedDate: rootNodeData.created_at,
                whatsapp: rootNodeData.whatsapp, // [FIX] Preserving WhatsApp
                email: rootNodeData.email,       // [FIX] Preserving Email
                username: rootNodeData.username, // [FIX] Preserving Username for linkage
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

                            const newNode = {
                                id: person.id,
                                name: person.nome,
                                pin: person.pin_atual || 'Iniciante',
                                status: person.status === 'ativo' ? 'active' : 'inactive',
                                level: bestParent.level + 1,
                                position: bestParent.children.length + 1,
                                avatarUrl: resolveAvatar(person),
                                joinedDate: person.created_at,
                                whatsapp: person.whatsapp,
                                email: person.email,
                                username: person.username,
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
