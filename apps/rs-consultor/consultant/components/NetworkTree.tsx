import React, { useState, useRef, WheelEvent, MouseEvent, useEffect, useMemo, useCallback, FC } from 'react';
import { IconPlus, IconMinus, IconRepeat, IconZoomIn, IconZoomOut, IconMaximize, IconMinimize, IconCheckCircle, IconX, IconFileClock, IconWhatsapp, IconMail, IconPhone } from '../../components/icons';
import Modal from '../../components/Modal';
import type { NetworkNode } from '../../types';

// --- Constants & Configs ---
const NODE_WIDTH = 100;
const NODE_HEIGHT = 100;
const HORIZONTAL_SPACING = 30;
const VERTICAL_SPACING = 70;

const statusMap = {
    active: { icon: IconCheckCircle, color: 'text-green-400', label: 'Ativo' },
    inactive: { icon: IconX, color: 'text-red-400', label: 'Inativo' },
    pending: { icon: IconFileClock, color: 'text-yellow-400', label: 'Pendente' },
};

const pinColorMap: { [key: string]: { iconColor: string; bgColor: string } } = {
    'Diamante': { iconColor: '#B9F2FF', bgColor: '#1E3A8A' },
    'Ouro': { iconColor: '#FFD700', bgColor: '#78350F' },
    'Safira': { iconColor: '#0F52BA', bgColor: '#1e3a8a' },
    'Prata': { iconColor: '#C0C0C0', bgColor: '#374151' },
    'Bronze': { iconColor: '#CD7F32', bgColor: '#451A03' },
    'Iniciante': { iconColor: '#9ca3af', bgColor: '#1f2937' },
    'Vago': { iconColor: '#4b5563', bgColor: '#111827' }
};

export const generateInitials = (name: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
};

const getUserColor = (id: string, name: string): string => {
    let hash = 0;
    const seed = id + name;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 45%)`;
};

const NodeCard: FC<{ node: NetworkNode }> = ({ node }) => {
    const { bgColor, iconColor } = pinColorMap[node.pin || 'Iniciante'] || pinColorMap['Iniciante'];
    const normalizedStatus = (node.status || '').toLowerCase();
    const statusKey = normalizedStatus.includes('ativ') ? 'active' : (normalizedStatus.includes('pendent') ? 'pending' : 'inactive');
    const statusInfo = statusMap[statusKey as keyof typeof statusMap] || statusMap.inactive;
    const StatusIcon = !node.isEmpty ? statusInfo.icon : () => null;

    if (node.isEmpty) {
        return (
            <div className="flex flex-col items-center group select-none">
                <div className="relative w-24 h-24 flex items-center justify-center text-gray-500 bg-brand-gray/50 border-2 border-dashed border-brand-gray-light transition-all" style={{ clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' }}>
                    <IconPlus className="w-8 h-8 group-hover:scale-125 transition-transform text-brand-gold" />
                </div>
                <div className="text-center mt-2">
                    <p className="font-bold text-[10px] text-gray-500">Posição Vaga</p>
                </div>
            </div>
        );
    }

    const userColor = getUserColor(node.id, node.name);
    const initials = generateInitials(node.name);

    return (
        <div className="flex flex-col items-center group select-none">
            <div className="relative w-24 h-24 flex items-center justify-center transition-all duration-300 transform group-hover:scale-105" style={{ clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' }}>
                <div
                    className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: userColor }}
                ></div>
                {(node.avatarUrl || (node as any).avatar_url) ? (
                    <img
                        src={node.avatarUrl || (node as any).avatar_url}
                        alt={node.name}
                        className="w-20 h-20 object-cover z-10 pointer-events-none"
                        style={{ clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' }}
                    />
                ) : (
                    <div
                        className="w-20 h-20 flex items-center justify-center text-white font-black text-2xl z-10"
                        style={{
                            clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
                            backgroundColor: userColor,
                            filter: 'brightness(1.1)',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}
                    >
                        {initials}
                    </div>
                )}
            </div>
            <div className="text-center mt-2 w-28">
                <p className="font-bold text-white text-xs truncate" title={node.name}>{node.name}</p>
                {node.pin && <p className="text-[10px] font-semibold" style={{ color: iconColor }}>{node.pin}</p>}
                <div className={`flex items-center justify-center space-x-1 text-[10px] ${statusInfo.color}`}>
                    <StatusIcon size={10} />
                    <span>{statusInfo.label}</span>
                </div>
            </div>
        </div>
    );
};

const Node: FC<{ node: NetworkNode; style: React.CSSProperties; isExpanded: boolean; hasChildren: boolean; onToggle: () => void; onClick: (node: NetworkNode) => void; }> = React.memo(({ node, style, isExpanded, hasChildren, onToggle, onClick }) => (
    <div style={style} className="absolute transition-all duration-500 ease-in-out node-wrapper cursor-pointer" data-node-id={node.id}>
        <div className="relative">
            <div onClick={() => !node.isEmpty && onClick(node)}>
                <NodeCard node={node} />
            </div>
            {hasChildren && (
                <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-brand-gray border-2 border-brand-gray-light rounded-full text-white flex items-center justify-center z-10 hover:border-brand-gold transition-all hover:scale-110">
                    {isExpanded ? <IconMinus size={14} /> : <IconPlus size={14} />}
                </button>
            )}
        </div>
    </div>
));

interface NetworkTreeProps {
    title: string;
    rootNode: NetworkNode;
}

const NetworkTree: React.FC<NetworkTreeProps> = ({ title, rootNode }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState({ scale: 0.6, x: 0, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [initialTransform, setInitialTransform] = useState({ x: 0, y: 0 });
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<NetworkNode[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (rootNode?.id) {
            setExpandedNodes(new Set([rootNode.id]));
        }
    }, [rootNode?.id]);

    const handleToggleExpand = useCallback((nodeId: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    }, []);

    const { nodesToRender, linesToRender, treeDimensions } = useMemo(() => {
        const nodes: { node: NetworkNode; style: React.CSSProperties; }[] = [];
        const lines: { key: string; d: string; }[] = [];
        const subtreeWidths = new Map<string, number>();

        function getSubtreeWidth(node: NetworkNode): number {
            if (!node) return 0;
            if (subtreeWidths.has(node.id)) return subtreeWidths.get(node.id)!;
            if (!expandedNodes.has(node.id) || !node.children || node.children.length === 0) {
                return NODE_WIDTH;
            }
            const width = node.children.reduce((acc, child) => {
                if (!child) return acc;
                return acc + getSubtreeWidth(child);
            }, 0) + (node.children.filter(c => !!c).length - 1) * HORIZONTAL_SPACING;
            subtreeWidths.set(node.id, width);
            return width;
        }

        function buildLayout(node: NetworkNode, level: number, centerX: number) {
            const y = level * (NODE_HEIGHT + VERTICAL_SPACING);
            const x = centerX - NODE_WIDTH / 2;
            nodes.push({ node, style: { transform: `translate(${x}px, ${y}px)`, width: NODE_WIDTH, height: NODE_HEIGHT } });

            if (expandedNodes.has(node.id) && node.children?.length > 0) {
                const totalWidth = getSubtreeWidth(node);
                let currentChildX = centerX - totalWidth / 2;
                node.children.forEach(child => {
                    if (!child) return;
                    const childWidth = getSubtreeWidth(child);
                    const childCenterX = currentChildX + childWidth / 2;
                    const x1 = centerX;
                    const y1 = y + NODE_HEIGHT / 2 + 15;
                    const x2 = childCenterX;
                    const y2 = (level + 1) * (NODE_HEIGHT + VERTICAL_SPACING);
                    lines.push({
                        key: `${node.id}-${child.id}`,
                        d: `M ${x1},${y1} C ${x1},${y1 + 40} ${x2},${y2 - 40} ${x2},${y2}`
                    });
                    buildLayout(child, level + 1, childCenterX);
                    currentChildX += childWidth + HORIZONTAL_SPACING;
                });
            }
        }

        if (!rootNode) return { nodesToRender: [], linesToRender: [], treeDimensions: { width: 0, height: 0 } };
        const totalWidth = getSubtreeWidth(rootNode);
        buildLayout(rootNode, 0, totalWidth / 2);

        let minX = Infinity, maxX = -Infinity, maxY = -Infinity;
        nodes.forEach(n => {
            const xStr = n.style.transform!.toString().match(/translate\(([-0-9.]+)px/)![1];
            const yStr = n.style.transform!.toString().match(/, ([-0-9.]+)px\)/)![1];
            const x = parseFloat(xStr);
            const y = parseFloat(yStr);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x + NODE_WIDTH);
            maxY = Math.max(maxY, y + NODE_HEIGHT);
        });

        nodes.forEach(n => {
            const xStr = n.style.transform!.toString().match(/translate\(([-0-9.]+)px/)![1];
            const yStr = n.style.transform!.toString().match(/, ([-0-9.]+)px\)/)![1];
            n.style.transform = `translate(${parseFloat(xStr) - minX}px, ${parseFloat(yStr)}px)`;
        });
        lines.forEach(l => {
            const points = l.d.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];
            l.d = `M ${points[0] - minX},${points[1]} C ${points[2] - minX},${points[3]} ${points[4] - minX},${points[5]} ${points[6] - minX},${points[7]}`;
        });

        return { nodesToRender: nodes, linesToRender: lines, treeDimensions: { width: maxX - minX, height: maxY } };
    }, [rootNode, expandedNodes]);

    const centerView = useCallback(() => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.clientWidth;
            const containerHeight = containerRef.current.clientHeight;
            const newX = (containerWidth - treeDimensions.width * transform.scale) / 2;
            const newY = (containerHeight - treeDimensions.height * transform.scale) / 2 + 50;
            setTransform(prev => ({ ...prev, x: newX, y: Math.max(50, newY) }));
        }
    }, [treeDimensions, transform.scale]);

    useEffect(() => { centerView(); }, [isFullScreen, treeDimensions.width, centerView]);

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('.node-wrapper')) return;
        e.preventDefault();
        setIsDragging(true);
        setStartPos({ x: e.clientX, y: e.clientY });
        setInitialTransform({ x: transform.x, y: transform.y });
    };

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        setTransform(prev => ({ ...prev, x: initialTransform.x + (e.clientX - startPos.x), y: initialTransform.y + (e.clientY - startPos.y) }));
    };

    const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        const zoomFactor = 1.2;
        const newScale = e.deltaY < 0 ? transform.scale * zoomFactor : transform.scale / zoomFactor;
        const clampedScale = Math.max(0.2, Math.min(2.0, newScale));
        if (clampedScale === transform.scale) return;
        const rect = containerRef.current!.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const contentX = (mouseX - transform.x) / transform.scale;
        const contentY = (mouseY - transform.y) / transform.scale;
        setTransform({ scale: clampedScale, x: mouseX - contentX * clampedScale, y: mouseY - contentY * clampedScale });
    };

    const handleZoom = (dir: 'in' | 'out') => {
        const factor = dir === 'in' ? 1.2 : 1 / 1.2;
        const newScale = Math.max(0.2, Math.min(2.0, transform.scale * factor));
        if (containerRef.current) {
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;
            const contentX = (w / 2 - transform.x) / transform.scale;
            const contentY = (h / 2 - transform.y) / transform.scale;
            setTransform({ scale: newScale, x: w / 2 - contentX * newScale, y: h / 2 - contentY * newScale });
        }
    };

    return (
        <div className={isFullScreen ? 'fixed inset-0 z-[100] flex flex-col bg-brand-dark p-6' : 'h-[600px] w-full flex flex-col relative z-10'}>
            <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <div className="flex gap-2">
                    <button onClick={centerView} className="bg-brand-gray p-2 rounded-md hover:bg-brand-gold hover:text-brand-dark transition-all"><IconRepeat size={18} /></button>
                    <button onClick={() => setIsFullScreen(!isFullScreen)} className="bg-brand-gray p-2 rounded-md hover:bg-brand-gold hover:text-brand-dark transition-all">{isFullScreen ? <IconMinimize size={18} /> : <IconMaximize size={18} />}</button>
                </div>
            </div>
            <div ref={containerRef} onMouseDown={handleMouseDown} onMouseUp={() => setIsDragging(false)} onMouseLeave={() => setIsDragging(false)} onMouseMove={handleMouseMove} onWheel={handleWheel} className={`flex-grow bg-brand-dark/50 border border-brand-gray-light overflow-hidden relative rounded-lg ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}>
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                    <button onClick={() => handleZoom('in')} className="control-button"><IconZoomIn size={18} /></button>
                    <button onClick={() => handleZoom('out')} className="control-button"><IconZoomOut size={18} /></button>
                </div>
                <div className="w-full h-full" style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0' }}>
                    <div className="relative" style={{ width: treeDimensions.width, height: treeDimensions.height }}>
                        <svg className="absolute inset-0 pointer-events-none overflow-visible">
                            {linesToRender.map(line => <path key={line.key} d={line.d} stroke="#4A5568" strokeWidth="2" fill="none" className="transition-all duration-500" />)}
                        </svg>
                        {nodesToRender.map(({ node, style }) => (
                            <Node key={node.id} node={node} style={style} isExpanded={expandedNodes.has(node.id)} hasChildren={node.children && node.children.length > 0} onToggle={() => handleToggleExpand(node.id)} onClick={(n) => setSelectedNode(n)} />
                        ))}
                    </div>
                </div>
            </div>
            <Modal isOpen={!!selectedNode} onClose={() => setSelectedNode(null)} title="Detalhes do Consultor">
                {selectedNode && (
                    <div className="space-y-4">
                        <div className="flex items-start space-x-6">
                            <div className="relative">
                                {(selectedNode.avatarUrl || (selectedNode as any).avatar_url) ? (
                                    <img src={selectedNode.avatarUrl || (selectedNode as any).avatar_url} alt={selectedNode.name} className="h-24 w-24 rounded-2xl object-cover border-4 border-brand-gray-light shadow-xl" />
                                ) : (
                                    <div
                                        className="h-24 w-24 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-xl"
                                        style={{ backgroundColor: getUserColor(selectedNode.id, selectedNode.name) }}
                                    >
                                        {generateInitials(selectedNode.name)}
                                    </div>
                                )}
                                <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg ${selectedNode.status === 'active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                    }`}>
                                    {selectedNode.status === 'active' ? 'Ativo' : 'Inativo'}
                                </div>
                            </div>
                            <div className="flex-grow space-y-3">
                                <div>
                                    <h3 className="text-2xl font-black text-white leading-tight">{selectedNode.name}</h3>
                                    <p className="font-bold text-sm tracking-widest uppercase opacity-60" style={{ color: pinColorMap[selectedNode.pin || 'Iniciante']?.iconColor || '#9ca3af' }}>
                                        {selectedNode.pin}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-2 pt-2">
                                    {selectedNode.whatsapp && (
                                        <a
                                            href={`https://wa.me/${selectedNode.whatsapp.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-all group"
                                        >
                                            <IconWhatsapp className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold uppercase opacity-60 leading-none mb-1 text-inherit">WhatsApp</span>
                                                <span className="font-bold text-inherit">{selectedNode.whatsapp}</span>
                                            </div>
                                        </a>
                                    )}

                                    {selectedNode.email && (
                                        <a
                                            href={`mailto:${selectedNode.email}`}
                                            className="flex items-center space-x-3 p-3 rounded-xl bg-brand-gold/10 border border-brand-gold/20 text-brand-gold hover:bg-brand-gold hover:text-brand-dark transition-all group"
                                        >
                                            <IconMail className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold uppercase opacity-60 leading-none mb-1 text-inherit">E-mail</span>
                                                <span className="font-bold text-inherit truncate max-w-[200px]">{selectedNode.email}</span>
                                            </div>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
            <style>{`.control-button { height: 36px; width: 36px; background: rgba(30,30,30,0.8); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s; } .control-button:hover { background: #FFD700; color: #121212; }`}</style>
        </div>
    );
};

export default NetworkTree;