import React, { useEffect, useMemo, useState } from 'react';
import {
    UserCircleIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon,
    UsersIcon,
    FunnelIcon,
    PencilIcon,
    KeyIcon
} from './icons';
import type { Consultant } from '../types';
import { consultantsAPI } from '../src/services/api';

interface NetworkNode {
    id: string;
    name: string;
    pin: string;
    status: string;
    avatar: string;
    level?: number;
    directCount?: number;
    hasChildren?: boolean;
    children?: NetworkNode[];
    whatsapp?: string;
    email?: string;
}

interface NetworkTreeViewProps {
    initialId?: string;
    consultants?: Consultant[];
    onEdit?: (c: Consultant) => void;
    onResetPassword?: (c: Consultant) => void;
    onSelect?: (c: Consultant) => void;
}

const normalizeApiNode = (node: any, fallback?: Partial<NetworkNode>): NetworkNode => ({
    id: String(node?.id || fallback?.id || ''),
    name: node?.name || node?.nome || fallback?.name || 'Consultor',
    pin: node?.pin || node?.pin_atual || fallback?.pin || 'Consultor',
    status: node?.status || fallback?.status || 'ativo',
    avatar: node?.avatar || fallback?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(node?.name || node?.nome || fallback?.name || 'User')}&background=random`,
    level: node?.level ?? fallback?.level ?? 0,
    directCount: node?.directCount ?? fallback?.directCount ?? 0,
    hasChildren: node?.hasChildren ?? ((node?.children || []).length > 0),
    whatsapp: node?.whatsapp,
    email: node?.email,
    children: Array.isArray(node?.children)
        ? node.children.map((child: any) => normalizeApiNode(child))
        : (fallback?.children || []),
});

const NetworkTreeView: React.FC<NetworkTreeViewProps> = ({
    initialId,
    consultants = [],
    onEdit,
    onResetPassword,
    onSelect,
}) => {
    const [treeData, setTreeData] = useState<NetworkNode | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentId, setCurrentId] = useState<string | undefined>(initialId);
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [pinFilter, setPinFilter] = useState('Todos');
    const [showFilters, setShowFilters] = useState(false);

    const filteredConsultants = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return consultants.filter(c => {
            if (
                query &&
                !c.name.toLowerCase().includes(query) &&
                !(c.code && c.code.toLowerCase().includes(query)) &&
                !(c.username && c.username.toLowerCase().includes(query))
            ) {
                return false;
            }

            if (statusFilter !== 'Todos' && c.status !== statusFilter) {
                return false;
            }

            if (pinFilter !== 'Todos' && c.pin !== pinFilter) {
                return false;
            }

            return true;
        });
    }, [consultants, searchQuery, statusFilter, pinFilter]);

    const findConsultantByAnyId = (id?: string) => {
        if (!id) return undefined;
        return consultants.find(c =>
            String(c.id) === String(id) ||
            String(c.uuid || '') === String(id) ||
            String(c.username || '') === String(id)
        );
    };

    const buildFallbackNode = (id?: string): NetworkNode | null => {
        const consultant = findConsultantByAnyId(id) || consultants[0];
        if (!consultant) return null;

        return {
            id: String(consultant.uuid || consultant.id),
            name: consultant.name,
            pin: consultant.pin || consultant.careerPinCurrent || 'Consultor',
            status: consultant.status === 'Ativo' ? 'ativo' : consultant.status === 'Pendente' ? 'pendente' : 'inativo',
            avatar: consultant.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(consultant.name)}&background=random`,
            level: 0,
            directCount: consultant.networkDetails?.directs || 0,
            hasChildren: false,
            children: [],
            whatsapp: consultant.contact?.phone,
            email: consultant.contact?.email,
        };
    };

    const buildConsultantForAction = (node: NetworkNode): Consultant => {
        const existing = consultants.find(c =>
            String(c.id) === String(node.id) ||
            String(c.uuid || '') === String(node.id)
        );

        if (existing) {
            return existing;
        }

        return {
            id: node.id,
            uuid: node.id,
            code: String(node.id).slice(0, 8),
            username: '',
            name: node.name,
            avatar: node.avatar,
            pin: node.pin,
            digitalPin: 'RS One Star',
            network: 'Escritorio',
            balance: 0,
            status: node.status === 'ativo' ? 'Ativo' : node.status === 'pendente' ? 'Pendente' : 'Inativo',
            cpfCnpj: '',
            address: {
                street: '',
                city: '',
                state: '',
                zip: '',
            },
            contact: {
                email: node.email || '',
                phone: node.whatsapp || '',
            },
            bankInfo: {
                bank: '',
                agency: '',
                account: '',
                pixType: 'CPF',
                pixKey: '',
            },
            cycle: 0,
            networkDetails: {
                directs: node.directCount || 0,
            },
            activationHistory: [],
            walletStatement: [],
            permissions: {
                personalDataLocked: false,
                bankDataLocked: true,
                bonus_cycle: true,
                bonus_fidelity: true,
                bonus_matrix_fidelity: true,
                bonus_leadership: true,
                bonus_career: true,
                bonus_digital: true,
                access_platform: true,
            },
            sponsor: null,
            registrationDate: '',
            salesHistory: [],
            commissionHistory: [],
            purchaseHistory: [],
            sigmaActive: node.status === 'ativo',
            sigmaCyclesMonth: 0,
            careerPoints: 0,
            careerPinCurrent: node.pin,
            topSigmaPosition: null,
        };
    };

    useEffect(() => {
        if (!initialId || initialId === '1') {
            return;
        }

        if (initialId !== currentId) {
            setCurrentId(initialId);
        }
    }, [initialId]);

    const loadTree = async (id: string, isUpdate = false) => {
        if (!isUpdate) {
            setLoading(true);
        }
        setError(null);

        const fallbackNode = buildFallbackNode(id);

        try {
            const response = await consultantsAPI.getNetworkTree(id, 1);
            const apiTree = response.data?.data?.tree || response.data?.tree;

            if (apiTree) {
                const normalized = normalizeApiNode(apiTree, fallbackNode || undefined);
                setTreeData(normalized);
                if (!isUpdate) {
                    setExpandedNodes({ [normalized.id]: true });
                }
            } else if (fallbackNode) {
                setTreeData(fallbackNode);
                if (!isUpdate) {
                    setExpandedNodes({ [fallbackNode.id]: true });
                }
            } else {
                setTreeData(null);
                setError('Arvore nao encontrada para este consultor');
            }
        } catch (err: any) {
            if (fallbackNode) {
                setTreeData(fallbackNode);
                if (!isUpdate) {
                    setExpandedNodes({ [fallbackNode.id]: true });
                }
                setError(null);
            } else {
                setTreeData(null);
                setError(err.message || 'Erro ao carregar rede');
            }
        } finally {
            if (!isUpdate) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        const initialize = async () => {
            let targetId = currentId;

            if (!targetId || targetId === '1') {
                try {
                    const rootRes = await consultantsAPI.getNetworkRoot();
                    const rootId = rootRes.data?.root?.id;
                    if (rootId) {
                        setCurrentId(String(rootId));
                        return;
                    }
                } catch (err) {
                    console.error('Erro ao buscar root:', err);
                }

                const fallbackNode = buildFallbackNode();
                if (fallbackNode?.id) {
                    setCurrentId(fallbackNode.id);
                    return;
                }

                setLoading(false);
                return;
            }

            await loadTree(targetId);
        };

        initialize();
    }, [currentId, consultants]);

    const updateNodeChildren = (root: NetworkNode, targetId: string, newChildren: NetworkNode[]): NetworkNode => {
        if (String(root.id) === String(targetId)) {
            return { ...root, children: newChildren, hasChildren: newChildren.length > 0 };
        }

        return {
            ...root,
            children: (root.children || []).map(child => updateNodeChildren(child, targetId, newChildren)),
        };
    };

    const toggleNode = async (nodeId: string, e?: React.MouseEvent, childrenFromRender?: NetworkNode[]) => {
        if (e) e.stopPropagation();

        const isExpanding = !expandedNodes[nodeId];

        if (isExpanding && (!childrenFromRender || childrenFromRender.length === 0)) {
            try {
                const res = await consultantsAPI.getNetworkChildren(nodeId);
                const apiChildren = res.data?.data?.children || res.data?.children || [];
                const normalizedChildren = Array.isArray(apiChildren)
                    ? apiChildren.map((child: any) => normalizeApiNode(child))
                    : [];

                setTreeData(prev => prev ? updateNodeChildren(prev, nodeId, normalizedChildren) : prev);
            } catch (err) {
                console.error('Erro ao carregar filhos:', err);
            }
        }

        setExpandedNodes(prev => ({
            ...prev,
            [nodeId]: isExpanding,
        }));
    };

    const renderNode = (node: NetworkNode, level = 0) => {
        const isExpanded = expandedNodes[node.id];
        const hasChildren = !!node.hasChildren || !!(node.children && node.children.length > 0);
        const consultant = buildConsultantForAction(node);

        return (
            <div key={node.id} className="ml-8 mt-4">
                <div className={`group relative flex items-center gap-3 p-3 bg-gray-900 border ${currentId === node.id ? 'border-yellow-500 shadow-yellow-500/20 shadow-lg' : 'border-gray-800 hover:border-yellow-500/50'} rounded-xl transition-all min-w-[260px] hover:bg-gray-800/50`}>
                    {level > 0 && (
                        <div className="absolute -left-5 top-1/2 w-5 h-px bg-gray-700" />
                    )}

                    {hasChildren && (
                        <button
                            type="button"
                            onClick={(event) => toggleNode(node.id, event, node.children)}
                            className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 hover:scale-110 transition-all z-20 shadow-sm"
                        >
                            {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                        </button>
                    )}

                    <button
                        type="button"
                        className="flex items-center gap-3 flex-1 text-left"
                        onClick={() => {
                            setCurrentId(String(node.id));
                            if (onSelect) {
                                onSelect(consultant);
                            } else if (onEdit) {
                                onEdit(consultant);
                            }
                        }}
                    >
                        <img
                            src={node.avatar}
                            alt={node.name}
                            className="w-10 h-10 rounded-full border-2 border-gray-800 group-hover:border-yellow-500/50 transition-colors object-cover"
                        />

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="text-sm font-bold text-white truncate group-hover:text-yellow-500 transition-colors">{node.name}</h4>
                                {(node.level !== undefined && node.level !== null) && (
                                    <span className="text-[9px] font-bold text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded ml-auto">
                                        NIVEL {node.level}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                                    {node.pin}
                                </span>
                                <span className={`w-2 h-2 rounded-full ${node.status === 'ativo' ? 'bg-green-500' : node.status === 'pendente' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                <span className="text-[10px] font-black text-white ml-auto bg-gray-800/80 px-2 py-0.5 rounded-lg border border-gray-700 shadow-sm">
                                    {node.directCount ?? node.children?.length ?? 0} {(node.directCount ?? node.children?.length ?? 0) === 1 ? 'indicado' : 'indicados'}
                                </span>
                            </div>

                            <div className="flex gap-2 mt-2 pt-2 border-t border-gray-800/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                {onEdit && (
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onEdit(consultant);
                                        }}
                                        className="text-[10px] flex items-center gap-1 text-gray-400 hover:text-yellow-500 bg-gray-800 hover:bg-yellow-500/10 px-2 py-1 rounded"
                                    >
                                        <PencilIcon className="w-3 h-3" /> Editar
                                    </button>
                                )}
                                {onResetPassword && (
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onResetPassword(consultant);
                                        }}
                                        className="text-[10px] flex items-center gap-1 text-gray-400 hover:text-red-500 bg-gray-800 hover:bg-red-500/10 px-2 py-1 rounded"
                                    >
                                        <KeyIcon className="w-3 h-3" /> Senha
                                    </button>
                                )}
                            </div>
                        </div>
                    </button>
                </div>

                {isExpanded && hasChildren && (
                    <div className="relative border-l border-gray-800 ml-5 pl-3 transition-all animate-fade-in">
                        {(node.children || []).map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (error && !consultants.length) {
        return (
            <div className="p-10 text-center bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col items-center">
                <p className="text-red-400 font-bold mb-2">Ops! Alguma coisa deu errado</p>
                <div className="bg-red-950/50 p-3 rounded-lg mb-4 border border-red-500/20 max-w-md">
                    <p className="text-red-300 font-mono text-xs break-all">{error}</p>
                    <p className="text-red-500/50 text-[10px] mt-2 text-left">Dica: verifique a sessao e a conexao com a API.</p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setLoading(true);
                        setError(null);
                        setCurrentId(undefined);
                    }}
                    className="px-6 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95"
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-250px)] animate-fade-in">
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
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`text-xs flex items-center gap-1 mb-3 ${showFilters ? 'text-yellow-500' : 'text-gray-400 hover:text-white'}`}
                >
                    <FunnelIcon className="w-3 h-3" /> {showFilters ? 'Ocultar Filtros' : 'Filtros Avancados'}
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
                            <option>Consultor</option>
                            <option>Bronze</option>
                            <option>Prata</option>
                            <option>Ouro</option>
                            <option>Diamante</option>
                        </select>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {filteredConsultants.length > 0 ? (
                        filteredConsultants.map(c => {
                            const idToUse = String(c.uuid || c.id);
                            const isSelected = currentId === idToUse || currentId === String(c.id);
                            return (
                                <button
                                    type="button"
                                    key={`${c.id}-${c.uuid || 'no-uuid'}`}
                                    onClick={() => setCurrentId(idToUse)}
                                    className={`w-full text-left p-2 rounded-lg flex items-center gap-3 transition-colors border ${isSelected ? 'bg-yellow-500/20 border-yellow-500/50' : 'border-transparent hover:bg-gray-800'}`}
                                >
                                    <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full bg-gray-700 object-cover" />
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-yellow-400' : 'text-gray-200'}`}>
                                            {c.name}
                                        </p>
                                        <p className="text-[10px] text-gray-500 truncate">
                                            PIN: {c.pin} | ID: {c.code || c.id}
                                        </p>
                                    </div>
                                    <ChevronRightIcon className="w-3 h-3 text-gray-600" />
                                </button>
                            );
                        })
                    ) : (
                        <p className="text-center text-xs text-gray-500 py-4">Nenhum consultor encontrado.</p>
                    )}
                </div>

                <div className="mt-2 pt-2 border-t border-gray-800 text-[10px] text-gray-500 text-center">
                    {consultants.length} consultores carregados
                </div>
            </div>

            <div className="lg:col-span-3 bg-black/50 border border-gray-800 rounded-xl p-6 overflow-hidden flex flex-col h-full relative">
                <div className="flex items-center justify-between mb-6 z-10">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                            Arvore de Indicacao <span className="text-yellow-500 text-sm font-normal bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">Modo Admin</span>
                        </h2>
                        <p className="text-sm text-gray-400">Visualizando rede de: <strong className="text-white">{treeData?.name || '...'}</strong></p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                if (!treeData) return;
                                const allIds: Record<string, boolean> = {};
                                const collectIds = (node: NetworkNode) => {
                                    allIds[node.id] = true;
                                    (node.children || []).forEach(collectIds);
                                };
                                collectIds(treeData);
                                setExpandedNodes(allIds);
                            }}
                            className="px-4 py-2 text-xs font-bold text-white bg-yellow-600 rounded-lg hover:bg-yellow-500 transition-all shadow-lg active:scale-95"
                        >
                            Expandir Tudo
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (!treeData) return;
                                setExpandedNodes({ [treeData.id]: true });
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
                            <div className="p-4 bg-red-500/10 rounded-full mb-3">
                                <UserCircleIcon className="w-8 h-8 text-red-500" />
                            </div>
                            <p className="text-red-400 font-bold mb-1">Nao foi possivel carregar a rede</p>
                            <p className="text-red-400/60 text-xs mb-4">{error}</p>
                            <button
                                type="button"
                                onClick={() => currentId && loadTree(currentId)}
                                className="text-xs text-white bg-red-600 px-4 py-2 rounded hover:bg-red-500"
                            >
                                Tentar Novamente
                            </button>
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
                                            <img src={treeData.avatar} alt={treeData.name} className="w-14 h-14 rounded-full border-2 border-yellow-500 shadow-lg object-cover" />
                                            {(treeData.children || []).length > 0 && (
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
                                                <span className={`w-1.5 h-1.5 rounded-full ${treeData.status === 'ativo' ? 'bg-green-500' : treeData.status === 'pendente' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                                {treeData.whatsapp && <span className="text-[10px] text-gray-500 ml-1">{treeData.whatsapp}</span>}
                                            </div>
                                            <div className="mt-1 text-[10px] font-bold text-gray-400 bg-gray-800/50 px-2 py-0.5 rounded border border-gray-700/50 inline-block">
                                                {treeData.directCount || 0} diretos
                                            </div>
                                        </div>
                                    </div>

                                    {expandedNodes[treeData.id] && (treeData.children || []).length > 0 && (
                                        <div className="relative border-l-2 border-dashed border-gray-800 ml-7 pl-6 mt-4 animate-fade-in-down">
                                            {(treeData.children || []).map(child => renderNode(child, 1))}
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
                            <p className="max-w-xs text-sm">Selecione um consultor na lista ao lado para visualizar sua arvore de indicacao.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NetworkTreeView;
