import React, { useState, useEffect, useMemo } from 'react';
// Imports de Ícones
import { UserCircleIcon, ChevronDownIcon, ChevronRightIcon, MagnifyingGlassIcon, UsersIcon, FunnelIcon, PencilIcon, KeyIcon } from './icons';
import type { Consultant } from '../types';
import { consultantsAPI } from '../src/services/api';

// Definindo a interface NetworkNode aqui se não estiver importada corretamente de types
interface NetworkNode {
    id: string;
    name: string;
    pin: string;
    status: string;
    avatar: string;
    is_empty?: boolean;
    linha?: number;
    level?: number;
    directCount?: number;
    hasChildren?: boolean;
    children?: NetworkNode[];
}

interface NetworkTreeViewProps {
    initialId?: string;
    consultants?: Consultant[]; // Nova prop para lista completa
    onEdit?: (c: Consultant) => void;
    onResetPassword?: (c: Consultant) => void;
    onSelect?: (c: Consultant) => void;
}

const NetworkTreeView: React.FC<NetworkTreeViewProps> = ({ initialId, consultants = [], onEdit, onResetPassword, onSelect }) => {
    const [treeData, setTreeData] = useState<NetworkNode | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentId, setCurrentId] = useState<string | undefined>(initialId);
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

    // Estados para a Sidebar de Pesquisa e Filtros
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [pinFilter, setPinFilter] = useState('Todos');
    const [showFilters, setShowFilters] = useState(false);

    // Filtragem local
    const filteredConsultants = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return consultants.filter(c => {
            // Filtro de Texto
            if (query && !c.name.toLowerCase().includes(query) &&
                !(c.code && c.code.toLowerCase().includes(query)) &&
                !(c.username && c.username.toLowerCase().includes(query))) return false;

            // Filtro de Status
            if (statusFilter !== 'Todos' && c.status !== statusFilter) return false;

            // Filtro de PIN
            if (pinFilter !== 'Todos' && c.pin !== pinFilter) return false;

            return true;
        });
    }, [consultants, searchQuery, statusFilter, pinFilter]);


    // Sincronizar prop initialId com estado interno
    useEffect(() => {
        if (initialId && initialId !== currentId) {
            console.log('NetworkTreeView: Atualizando currentId via prop:', initialId);
            setCurrentId(initialId);
        }
    }, [initialId]);

    useEffect(() => {
        const initialize = async () => {
            let targetId = currentId;

            // Se for o ID '1' (antigo padrão) ou se não houver ID, buscar o Master do sistema
            if (!targetId || targetId === '1') {
                try {
                    // Tenta buscar o root via API
                    const rootRes = await consultantsAPI.getNetworkRoot();
                    if (rootRes.data?.root?.id) {
                        targetId = rootRes.data.root.id;
                        setCurrentId(targetId);
                        return; // O useEffect vai disparar de novo com o novo currentId
                    }
                    // Se não retornar root, tenta usar o ID do Rota Fácil Oficial (Admin) como fallback
                    console.warn('NetworkTreeView: Root não retornado pela API. Tentando ID Admin Oficial.');
                    const ADMIN_ROOT_ID = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
                    targetId = ADMIN_ROOT_ID;
                    setCurrentId(ADMIN_ROOT_ID);
                } catch (err) {
                    console.error('Erro ao buscar Root:', err);
                    // Fallback silencioso para ID Admin em caso de erro
                    const ADMIN_ROOT_ID = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
                    targetId = ADMIN_ROOT_ID;
                    setCurrentId(ADMIN_ROOT_ID);
                    return;
                }
            }

            if (targetId) {
                loadTree(targetId);
            } else {
                setLoading(false);
            }
        };

        initialize();
    }, [currentId]);

    const loadTree = async (id: string, isUpdate: boolean = false) => {
        console.log('NetworkTreeView: Iniciando loadTree para ID:', id);
        if (!isUpdate) setLoading(true);
        setError(null);
        try {
            // CARREGAMENTO INICIAL: Depth 1 (Raiz + 1 nível de filhos)
            const response = await consultantsAPI.getNetworkTree(id, 1);
            console.log('NetworkTreeView: Dados recebidos:', response.data);

            if (response.data?.tree) {
                setTreeData(response.data.tree);
                if (!isUpdate) {
                    setExpandedNodes({ [response.data.tree.id]: true });
                }
            } else {
                // Tenta montar um nó básico se a API falhar mas tivermos o ID
                if (targetId) {
                    console.warn('NetworkTreeView: API não retornou árvore completa. Usando nó básico.');
                    setTreeData({
                        id: targetId,
                        name: 'Carregando...',
                        pin: 'Consultor',
                        status: 'ativo',
                        avatar: `https://ui-avatars.com/api/?name=${targetId}&background=random`,
                        level: 0,
                        directCount: 0,
                        children: []
                    });
                } else {
                    setError('Árvore não encontrada para este consultor');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar rede');
        } finally {
            if (!isUpdate) setLoading(false);
        }
    };

    // Helper recursivo para atualizar filhos de um nó específico
    const updateNodeChildren = (root: NetworkNode, targetId: string, newChildren: NetworkNode[]): NetworkNode => {
        if (String(root.id) === String(targetId)) {
            return { ...root, children: newChildren };
        }
        if (root.children) {
            return {
                ...root,
                children: root.children.map(child => updateNodeChildren(child, targetId, newChildren))
            };
        }
        return root;
    };

    const toggleNode = async (nodeId: string, e?: React.MouseEvent, childrenFromRender?: NetworkNode[]) => {
        if (e) e.stopPropagation();

        const isExpanding = !expandedNodes[nodeId];

        // Lazy Load: Se expandir e não tiver filhos na memória, buscar API
        // Verificamos se childrenFromRender (passado pelo renderNode) está vazio
        if (isExpanding && (!childrenFromRender || childrenFromRender.length === 0)) {
            const btn = e?.currentTarget as HTMLElement;
            try {
                console.log('Lazy Loading children para:', nodeId);
                // Cursor de loading simples
                if (btn) btn.style.opacity = '0.5';
                if (btn) btn.style.pointerEvents = 'none';

                const res = await consultantsAPI.getNetworkChildren(nodeId);

                if (res.data?.children) {
                    setTreeData(prev => prev ? updateNodeChildren(prev, nodeId, res.data.children) : prev);
                } else {
                    throw new Error("Dados de filhos não recebidos da API");
                }
            } catch (err) {
                console.error('Erro ao carregar filhos:', err);
                alert("Erro ao carregar a rede deste consultor. Tente novamente.");
                return; // Impede a expansão visual se falhar
            } finally {
                if (btn) btn.style.opacity = '1';
                if (btn) btn.style.pointerEvents = 'auto';
            }
        }

        setExpandedNodes(prev => ({
            ...prev,
            [nodeId]: isExpanding
        }));
    };

    const renderNode = (node: NetworkNode, level: number = 0) => {
        const isExpanded = expandedNodes[node.id];
        // hasChildren considera flag do backend ou array local não vazio
        const hasChildren = node.hasChildren || (node.children && node.children.length > 0);

        const handleSelect = (e: React.MouseEvent) => {
            e.stopPropagation();
            // Tenta encontrar o consultor completo para passar para o modal
            const fullConsultant = consultants.find(c => c.id.toString() === node.id.toString() || c.uuid === node.id) || {
                ...node,
                uuid: node.id,
                id: node.id,
                // Default props to prevent Modal crash
                pin: 'Consultor',
                digitalPin: 'RS One Star', // Default
                sponsor: null,
                avatar: `https://ui-avatars.com/api/?name=${node.name}&background=random`,
                contact: { email: '', phone: (node as any).whatsapp || '' },
                address: { city: '', state: '', country: 'Brasil', street: '', zip: '' },
                bankInfo: { bank: '', agency: '', account: '', pixType: 'CPF', pixKey: '' },
                permissions: {
                    personalDataLocked: false,
                    bankDataLocked: true,
                    bonus_cycle: true,
                    bonus_fidelity: true,
                    bonus_matrix_fidelity: true,
                    bonus_leadership: true,
                    bonus_career: true, // Novo
                    bonus_digital: true, // Novo
                    access_platform: true
                },
                cycle: 0,
                networkDetails: { directs: 0 },
                salesHistory: [],
                commissionHistory: [],
                purchaseHistory: [],
                walletStatement: [],
                activationHistory: []
            } as any;

            if (onSelect) {
                onSelect(fullConsultant);
            } else if (onEdit) {
                onEdit(fullConsultant);
            }
        };

        const handleToggle = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (hasChildren) {
                toggleNode(node.id, e, node.children);
            }
        };

        return (
            <div key={node.id} className="ml-8 mt-4">
                <div
                    className={`group relative flex items-center gap-3 p-3 bg-gray-900 border ${currentId === node.id ? 'border-yellow-500 shadow-yellow-500/20 shadow-lg' : 'border-gray-800 hover:border-yellow-500/50'} rounded-xl transition-all cursor-pointer min-w-[260px] hover:bg-gray-800/50`}
                >
                    {/* Connector Line */}
                    {level > 0 && (
                        <div className="absolute -left-5 top-1/2 w-5 h-px bg-gray-700" />
                    )}

                    {/* Expand/Collapse Toggle Indicator - AGORA COM CLICK PRÓPRIO */}
                    {hasChildren && (
                        <div
                            onClick={handleToggle}
                            className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 hover:scale-110 cursor-pointer transition-all z-20 shadow-sm"
                        >
                            {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                        </div>
                    )}

                    {/* Área Principal CLICÁVEL para Select/Edit + Expandir */}
                    <div
                        className="flex items-center gap-3 flex-1"
                        onClick={(e) => {
                            if (hasChildren) {
                                handleToggle(e);
                            }
                        }}
                    >
                        <img
                            src={node.avatar}
                            alt={node.name}
                            className="w-10 h-10 rounded-full border-2 border-gray-800 group-hover:border-yellow-500/50 transition-colors"
                        />

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="text-sm font-bold text-white truncate group-hover:text-yellow-500 transition-colors">{node.name}</h4>
                                {(node.level !== undefined && node.level !== null) && (
                                    <span className="text-[9px] font-bold text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded ml-auto">
                                        NÍVEL {node.level}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                                    {node.pin}
                                </span>
                                <span className={`w-2 h-2 rounded-full ${node.status === 'ativo' ? 'bg-green-500' : 'bg-red-500'}`} />
                                {(node.directCount !== undefined || hasChildren) && (
                                    <span className="text-[10px] font-black text-white ml-auto bg-gray-800/80 px-2 py-0.5 rounded-lg border border-gray-700 shadow-sm">
                                        {node.directCount ?? node.children?.length} {(node.directCount ?? node.children?.length) === 1 ? 'indicado' : 'indicados'}
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-2 mt-2 pt-2 border-t border-gray-800/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelect(e);
                                    }}
                                    className="text-[10px] flex items-center gap-1 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded"
                                >
                                    <MagnifyingGlassIcon className="w-3 h-3" /> Ver Perfil
                                </button>
                                {onEdit && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Precisamos encontrar o objeto Consultant completo ou passar apenas o ID/Dados parciais
                                            const fullConsultant = consultants.find(c => c.id.toString() === node.id || c.uuid === node.id) || {
                                                ...node,
                                                uuid: node.id,
                                                id: node.id,
                                                contact: { email: '', phone: (node as any).whatsapp || '' },
                                                address: { city: '', state: '', country: 'Brasil', street: '', zip: '' },
                                                bankInfo: { bank: '', agency: '', account: '', pixType: 'CPF', pixKey: '' },
                                                permissions: {
                                                    personalDataLocked: false,
                                                    bankDataLocked: true,
                                                    bonus_cycle: true,
                                                    bonus_fidelity: true,
                                                    bonus_matrix_fidelity: true,
                                                    bonus_leadership: true,
                                                    bonus_career: true,
                                                    bonus_digital: true,
                                                    access_platform: true
                                                },
                                                cycle: 0,
                                                networkDetails: { directs: 0 },
                                                salesHistory: [],
                                                commissionHistory: [],
                                                purchaseHistory: [],
                                                walletStatement: [],
                                                activationHistory: []
                                            } as any;
                                            onEdit(fullConsultant);
                                        }}
                                        className="text-[10px] flex items-center gap-1 text-gray-400 hover:text-yellow-500 bg-gray-800 hover:bg-yellow-500/10 px-2 py-1 rounded"
                                    >
                                        <PencilIcon className="w-3 h-3" /> Editar
                                    </button>
                                )}
                                {onResetPassword && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const fullConsultant = consultants.find(c => c.id.toString() === node.id || c.uuid === node.id) || {
                                                ...node,
                                                uuid: node.id,
                                                id: node.id,
                                                contact: { email: '', phone: (node as any).whatsapp || '' },
                                                address: { city: '', state: '', country: 'Brasil', street: '', zip: '' },
                                                bankInfo: { bank: '', agency: '', account: '', pixType: 'CPF', pixKey: '' },
                                                permissions: {
                                                    personalDataLocked: false,
                                                    bankDataLocked: true,
                                                    bonus_cycle: true,
                                                    bonus_fidelity: true,
                                                    bonus_matrix_fidelity: true,
                                                    bonus_leadership: true,
                                                    bonus_career: true,
                                                    bonus_digital: true,
                                                    access_platform: true
                                                },
                                                cycle: 0,
                                                networkDetails: { directs: 0 },
                                                salesHistory: [],
                                                commissionHistory: [],
                                                purchaseHistory: [],
                                                walletStatement: [],
                                                activationHistory: []
                                            } as any;
                                            onResetPassword(fullConsultant);
                                        }}
                                        className="text-[10px] flex items-center gap-1 text-gray-400 hover:text-red-500 bg-gray-800 hover:bg-red-500/10 px-2 py-1 rounded"
                                    >
                                        <KeyIcon className="w-3 h-3" /> Senha
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {isExpanded && hasChildren && (
                    <div className="relative border-l border-gray-800 ml-5 pl-3 transition-all animate-fade-in">
                        {node.children?.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (error && !consultants.length) // Only full error if we can't even show sidebar
        return (

            <div className="p-10 text-center bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col items-center">
                <p className="text-red-400 font-bold mb-2">Ops! Alguma coisa deu errado</p>
                <div className="bg-red-950/50 p-3 rounded-lg mb-4 border border-red-500/20 max-w-md">
                    <p className="text-red-300 font-mono text-xs break-all">{error}</p>
                    <p className="text-red-500/50 text-[10px] mt-2 text-left">Dica: Verifique sua conexão ou se sua sessão expirou.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setLoading(true);
                            setError(null);
                            setCurrentId(undefined); // Isso vai disparar o useEffect de inicialização novamente
                        }}
                        className="px-6 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95"
                    >
                        Tentar Novamente (Buscar Raiz)
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-600 transition-all active:scale-95"
                    >
                        Recarregar Página
                    </button>
                </div>
            </div>
        );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-250px)] animate-fade-in">
            {/* --- COLUMN 1: SIDEBAR DE PESQUISA (NOVA) --- */}
            <div className="lg:col-span-1 bg-black/50 border border-gray-800 rounded-xl flex flex-col p-4 h-full">
                <div className="flex items-center gap-2 mb-4">
                    <UsersIcon className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-bold text-white">Buscar Consultor</h3>
                </div>

                <div className="relative mb-2">
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Nome, ID ou Username..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 pl-9"
                    />
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`text-xs flex items-center gap-1 mb-3 ${showFilters ? 'text-yellow-500' : 'text-gray-400 hover:text-white'}`}
                >
                    <FunnelIcon className="w-3 h-3" /> {showFilters ? 'Ocultar Filtros' : 'Filtros Avançados'}
                </button>

                {showFilters && (
                    <div className="grid grid-cols-2 gap-2 mb-4 animate-fade-in">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="bg-gray-900 border border-gray-700 text-white text-[10px] rounded p-1.5"
                        >
                            <option>Todos</option>
                            <option>Ativo</option>
                            <option>Inativo</option>
                            <option>Pendente</option>
                        </select>
                        <select
                            value={pinFilter}
                            onChange={e => setPinFilter(e.target.value)}
                            className="bg-gray-900 border border-gray-700 text-white text-[10px] rounded p-1.5"
                        >
                            <option>Todos</option>
                            <option>Bronze</option>
                            <option>Prata</option>
                            <option>Ouro</option>
                            <option>Diamante</option>
                        </select>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {filteredConsultants.length > 0 ? (
                        filteredConsultants.map(c => (
                            <button
                                key={`${c.id}-${c.uuid || 'no-uuid'}`}
                                onClick={() => {
                                    const idToUse = c.uuid || c.id.toString();
                                    console.log('NetworkTreeView: Selecionado na Sidebar:', c.name, idToUse);
                                    setCurrentId(idToUse);
                                }}
                                className={`w-full text-left p-2 rounded-lg flex items-center gap-3 transition-colors border ${(currentId === c.uuid || currentId === c.id.toString())
                                    ? 'bg-yellow-500/20 border-yellow-500/50'
                                    : 'border-transparent hover:bg-gray-800'
                                    }`}
                            >
                                <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full bg-gray-700 object-cover" />
                                <div className="min-w-0 flex-1">
                                    <p className={`text-xs font-bold truncate ${(currentId === c.uuid || currentId === c.id.toString()) ? 'text-yellow-400' : 'text-gray-200'}`}>
                                        {c.name}
                                    </p>
                                    <p className="text-[10px] text-gray-500 truncate">
                                        PIN: {c.pin} | ID: {c.code || c.id}
                                    </p>

                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {onEdit && (
                                        <button onClick={(e) => { e.stopPropagation(); onEdit(c); }} title="Editar" className="p-1 text-gray-400 hover:text-yellow-500 hover:bg-yellow-500/10 rounded">
                                            <PencilIcon className="w-3 h-3" />
                                        </button>
                                    )}
                                    {onResetPassword && (
                                        <button onClick={(e) => { e.stopPropagation(); onResetPassword(c); }} title="Resetar Senha" className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded">
                                            <KeyIcon className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                                <ChevronRightIcon className="w-3 h-3 text-gray-600" />
                            </button>
                        ))
                    ) : (
                        <p className="text-center text-xs text-gray-500 py-4">Nenhum consultor encontrado.</p>
                    )}
                </div>

                <div className="mt-2 pt-2 border-t border-gray-800 text-[10px] text-gray-500 text-center">
                    {consultants.length} consultores carregados
                </div>
            </div>

            {/* --- COLUMN 2: ÁRVORE VISUAL (EXISTENTE) --- */}
            <div className="lg:col-span-3 bg-black/50 border border-gray-800 rounded-xl p-6 overflow-hidden flex flex-col h-full relative">
                <div className="flex items-center justify-between mb-6 z-10">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                            Árvore de Indicação <span className="text-yellow-500 text-sm font-normal bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">Modo Admin</span>
                        </h2>
                        <p className="text-sm text-gray-400">Visualizando rede de: <strong className="text-white">{treeData?.name || '...'}</strong></p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                if (treeData) {
                                    const allIds: Record<string, boolean> = {};
                                    const collectIds = (n: NetworkNode) => {
                                        allIds[n.id] = true;
                                        n.children?.forEach(collectIds);
                                    };
                                    collectIds(treeData);
                                    setExpandedNodes(allIds);
                                }
                            }}
                            className="px-4 py-2 text-xs font-bold text-white bg-yellow-600 rounded-lg hover:bg-yellow-500 transition-all shadow-lg active:scale-95"
                        >
                            Expandir Tudo
                        </button>
                        <button
                            onClick={() => {
                                setExpandedNodes({});
                                if (treeData) setExpandedNodes({ [treeData.id]: true });
                            }}
                            className="px-4 py-2 text-xs font-bold text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition-all active:scale-95"
                        >
                            Recolher
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar relative">
                    {loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500" />
                            <p className="text-gray-400 animate-pulse text-sm">Carregando rede...</p>
                        </div>
                    ) : error ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
                            <div className="p-4 bg-red-500/10 rounded-full mb-3"><UserCircleIcon className="w-8 h-8 text-red-500" /></div>
                            <p className="text-red-400 font-bold mb-1">Não foi possível carregar a rede</p>
                            <p className="text-red-400/60 text-xs mb-4">{error}</p>
                            <button onClick={() => loadTree(currentId || 'root')} className="text-xs text-white bg-red-600 px-4 py-2 rounded hover:bg-red-500">Tentar Novamente</button>
                        </div>
                    ) : treeData ? (
                        <div className="inline-block min-w-full align-middle pb-20 pl-4">
                            <div className="flex justify-start">
                                <div className="mt-4">
                                    <div
                                        onClick={() => toggleNode(treeData.id)}
                                        className="flex items-center gap-4 p-4 bg-gray-900 border-2 border-yellow-600 rounded-xl shadow-2xl shadow-yellow-500/10 min-w-[280px] cursor-pointer hover:border-yellow-500 transition-all group relative z-10"
                                    >
                                        <div className="relative">
                                            <img src={treeData.avatar} alt={treeData.name} className="w-14 h-14 rounded-full border-2 border-yellow-500 shadow-lg" />
                                            {treeData.children && treeData.children.length > 0 && (
                                                <div className="absolute -right-1 -bottom-1 w-5 h-5 bg-yellow-600 rounded-full flex items-center justify-center border-2 border-gray-900">
                                                    {expandedNodes[treeData.id] ? <ChevronDownIcon className="w-3 h-3 text-white" /> : <ChevronRightIcon className="w-3 h-3 text-white" />}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-black text-white group-hover:text-yellow-500 transition-colors uppercase">{treeData.name}</h3>
                                                <span className="text-[9px] font-black text-gray-900 bg-yellow-500 px-1.5 py-0.5 rounded">RAIZ</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] uppercase font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded">
                                                    {treeData.pin}
                                                </span>
                                                <span className={`w-1.5 h-1.5 rounded-full ${treeData.status === 'ativo' ? 'bg-green-500' : 'bg-red-500'}`} />

                                                {/* INFORMAÇÕES EXTRAS: EMAIL/WHATS */}
                                                {(treeData as any).whatsapp && <span className="text-[10px] text-gray-500 ml-1">{(treeData as any).whatsapp}</span>}
                                            </div>
                                            {treeData.directCount !== undefined && (
                                                <div className="mt-1 text-[10px] font-bold text-gray-400 bg-gray-800/50 px-2 py-0.5 rounded border border-gray-700/50 inline-block">
                                                    {treeData.directCount} diretos
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {expandedNodes[treeData.id] && treeData.children && treeData.children.length > 0 && (
                                        <div className="relative border-l-2 border-dashed border-gray-800 ml-7 pl-6 mt-4 animate-fade-in-down">
                                            {treeData.children?.map(child => renderNode(child, 1))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-10 text-center">
                            <div className="bg-gray-800/50 p-6 rounded-full mb-4">
                                <UserCircleIcon className="w-12 h-12 text-gray-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-400 mb-2">Nenhuma rede selecionada</h3>
                            <p className="max-w-xs text-sm">Selecione um consultor na lista ao lado para visualizar sua árvore de indicação.</p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default NetworkTreeView;
