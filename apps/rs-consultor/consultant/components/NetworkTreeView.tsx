import React, { useState, useEffect } from 'react';
import { sigmaApi } from '../services/sigmaApi';
import { IconChevronDown, IconChevronRight, IconUsers, IconChart, IconGitFork } from '../../components/icons';

interface NetworkNode {
    id: string;
    name: string;
    pin: string;
    status: string;
    avatar?: string;
    level: number;
    directCount?: number;
    individualCycles?: number;
    teamCycles?: number;
    totalNetworkCount?: number;
    children?: NetworkNode[];
}

interface NetworkTreeViewProps {
    initialId?: string;
}

const NetworkTreeView: React.FC<NetworkTreeViewProps> = ({ initialId }) => {
    const [treeData, setTreeData] = useState<NetworkNode | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

    useEffect(() => {
        loadTree();
    }, []);

    const loadTree = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await sigmaApi.getTree();
            if (response.success && response.data?.tree) {
                const root = response.data.tree;
                setTreeData(root);
                setExpandedNodes({ [root.id]: true });
            } else {
                setError('Árvore não encontrada ou erro na sincronização');
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar rede');
        } finally {
            setLoading(false);
        }
    };

    const toggleNode = (nodeId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setExpandedNodes(prev => ({
            ...prev,
            [nodeId]: !prev[nodeId]
        }));
    };

    const renderNode = (node: NetworkNode, level: number = 0) => {
        const isExpanded = expandedNodes[node.id];
        const hasChildren = node.children && node.children.length > 0;

        return (
            <div key={node.id} className={`${level > 0 ? 'ml-8' : ''} mt-4`}>
                <div
                    onClick={() => hasChildren && toggleNode(node.id)}
                    className={`group relative flex items-center gap-4 p-4 bg-brand-gray-dark border ${level === 0 ? 'border-brand-gold shadow-brand-gold/20 shadow-xl' : 'border-brand-gray-light hover:border-gray-500'} rounded-2xl transition-all cursor-pointer min-w-[320px]`}
                >
                    {/* Linha de Conexão */}
                    {level > 0 && (
                        <div className="absolute -left-5 top-1/2 w-5 h-px bg-brand-gray-light" />
                    )}

                    {/* Toggle Expansão */}
                    {hasChildren && (
                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-brand-gray-dark border border-brand-gray-light rounded-full flex items-center justify-center text-gray-400 group-hover:text-brand-gold transition-all z-10 shadow-lg">
                            {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                        </div>
                    )}

                    <img
                        src={(!node.avatar || node.avatar.includes('0aa67016')) ? `/logo-rs.png` : node.avatar}
                        alt={node.name}
                        className="w-12 h-12 rounded-full border-2 border-brand-gray-light group-hover:border-brand-gold transition-colors"
                    />

                    <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-8 min-w-0">
                        {/* IDENTIDADE (ESQUERDA) */}
                        <div className="flex flex-col min-w-[200px]">
                            <h4 className="text-xl font-black text-white truncate group-hover:text-brand-gold transition-colors tracking-tighter uppercase leading-none mb-2">
                                {node.name}
                            </h4>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase tracking-widest font-black text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded border border-brand-gold/20 shadow-inner">
                                    {node.pin}
                                </span>
                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/10">
                                    ID: {node.id.split('-')[0].toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* MÉTRICAS (CENTRO/DIREITA) - LARGURA AMPLIADA PARA ESCALABILIDADE */}
                        <div className="flex flex-wrap items-center gap-6 md:ml-auto">
                            {/* BLOCO CICLOS */}
                            <div className="flex flex-col bg-white/5 px-6 py-2.5 rounded-xl border border-white/5 min-w-[160px]">
                                <span className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em] mb-2 opacity-90">Ciclos</span>
                                <div className="flex items-center gap-5">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter mb-0.5">Eu</span>
                                        <span className="text-2xl font-black text-white leading-none tracking-tighter">{node.individualCycles || 0}</span>
                                    </div>
                                    <div className="w-px h-8 bg-white/10" />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter mb-0.5">Equipe</span>
                                        <span className="text-2xl font-black text-blue-400 leading-none tracking-tighter">{node.teamCycles || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* BLOCO CONSULTORES */}
                            <div className="flex flex-col bg-white/5 px-6 py-2.5 rounded-xl border border-white/5 min-w-[180px]">
                                <span className="text-[9px] font-black text-green-400 uppercase tracking-[0.2em] mb-2 opacity-90">Consultores</span>
                                <div className="flex items-center gap-5">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter mb-0.5">Diretos</span>
                                        <span className="text-2xl font-black text-white leading-none tracking-tighter">{node.directCount || 0}</span>
                                    </div>
                                    <div className="w-px h-8 bg-white/10" />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter mb-0.5">Equipe</span>
                                        <span className="text-2xl font-black text-purple-400 leading-none tracking-tighter">{node.totalNetworkCount || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* STATUS / ATIVAÇÃO (EXTREMA DIREITA) */}
                            <div className="flex flex-col items-center gap-2 ml-4 pr-2 min-w-[80px]">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ativação</span>
                                <span className={`w-4 h-4 rounded-full ${node.status === 'ativo' || node.status === 'Ativo' ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.9)]' : 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.9)]'} transition-all duration-500`} />
                            </div>
                        </div>
                    </div>
                </div>

                {isExpanded && hasChildren && (
                    <div className="relative border-l border-brand-gray-light ml-6 pl-4 transition-all animate-fade-in">
                        {node.children.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold" />
            <p className="text-brand-gold animate-pulse text-[10px] uppercase tracking-[0.3em] font-black">Sincronizando Métrica de Rede...</p>
        </div>
    );

    if (error) return (
        <div className="p-10 text-center border border-red-500/20 rounded-2xl bg-red-500/5 flex flex-col items-center">
            <p className="text-red-500 font-bold mb-4">{error}</p>
            <button
                onClick={loadTree}
                className="px-8 py-3 bg-red-500/10 border border-red-500/50 text-red-500 text-[10px] font-black uppercase rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95"
            >
                Tentar Novamente
            </button>
        </div>
    );

    return (
        <div className="animate-fade-in text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Matriz de Evolução Interativa</h3>
                    <p className="text-xs text-brand-text-dim uppercase tracking-widest font-bold opacity-60">Performance completa por consultor</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            if (treeData) {
                                const allIds: Record<string, boolean> = {};
                                const collect = (n: any) => {
                                    allIds[n.id] = true;
                                    n.children?.forEach(collect);
                                };
                                collect(treeData);
                                setExpandedNodes(allIds);
                            }
                        }}
                        className="px-6 py-3 text-[10px] font-black uppercase text-white bg-brand-gold rounded-xl hover:bg-yellow-500 transition-all shadow-xl shadow-brand-gold/20 active:scale-95 border border-white/10"
                    >
                        Expandir Tudo
                    </button>
                    <button
                        onClick={() => setExpandedNodes({ [treeData?.id || '']: true })}
                        className="px-6 py-3 text-[10px] font-black uppercase text-gray-300 bg-brand-gray border border-white/10 rounded-xl hover:bg-brand-gray-light transition-all active:scale-95"
                    >
                        Recolher Tudo
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto pb-24 custom-scrollbar">
                <div className="inline-block min-w-full align-middle px-4">
                    {treeData && renderNode(treeData, 0)}
                </div>
            </div>
        </div>
    );
};

export default NetworkTreeView;
