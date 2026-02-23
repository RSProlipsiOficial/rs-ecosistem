import React, { useState, useRef, WheelEvent, MouseEvent, useEffect, useMemo, useCallback, FC } from 'react';
import type { NetworkNode } from './types';
import { IconPlus, IconMinus, IconRepeat, IconZoomIn, IconZoomOut, IconMaximize, IconMinimize, IconMessage, IconCheckCircle, IconX, IconFileClock } from '../icons';
import Modal from '../Modal';

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

// Simplified color map for pins in admin
const pinColorMap: { [key: string]: { iconColor: string; bgColor: string } } = {
    'Diamante': { iconColor: '#B9F2FF', bgColor: '#1E3A8A' },
    'Ouro': { iconColor: '#FFD700', bgColor: '#78350F' },
    'Platina': { iconColor: '#E5E4E2', bgColor: '#4B5563' },
    'Prata': { iconColor: '#C0C0C0', bgColor: '#374151' },
    'Bronze': { iconColor: '#CD7F32', bgColor: '#451A03' },
    'Iniciante': { iconColor: '#9ca3af', bgColor: '#1f2937' },
    'Vago': { iconColor: '#4b5563', bgColor: '#111827' }
};

// --- Node Components ---
const NodeCard: FC<{ node: NetworkNode }> = ({ node }) => {
    const { bgColor, iconColor } = pinColorMap[node.pin || 'Iniciante'] || pinColorMap['Iniciante'];

    const normalizedStatus = (node.status || '').toLowerCase();
    const statusKey = normalizedStatus.includes('ativ') ? 'active' :
        (normalizedStatus.includes('pendent') ? 'pending' : 'inactive');

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

    return (
        <div className="flex flex-col items-center group select-none">
            <div className="relative w-24 h-24 flex items-center justify-center transition-all duration-300 transform group-hover:scale-105" style={{ clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' }}>
                <div className="absolute inset-0 opacity-60" style={{ backgroundColor: bgColor }}></div>
                <img src={node.avatarUrl || '/img/default-avatar.png'} alt={node.name} className="w-20 h-20 object-cover pointer-events-none" style={{ clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' }} />
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
    matrixWidth?: number;
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
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));

    // Initialize expandedNodes with rootNode.id
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
            const x = parseFloat(n.style.transform!.toString().match(/translate\(([-0-9.]+)px/)![1]);
            const y = parseFloat(n.style.transform!.toString().match(/, ([-0-9.]+)px\)/)![1]);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x + NODE_WIDTH);
            maxY = Math.max(maxY, y + NODE_HEIGHT);
        });

        nodes.forEach(n => {
            const x = parseFloat(n.style.transform!.toString().match(/translate\(([-0-9.]+)px/)![1]);
            const y = parseFloat(n.style.transform!.toString().match(/, ([-0-9.]+)px\)/)![1]);
            n.style.transform = `translate(${x - minX}px, ${y}px)`;
        });
        lines.forEach(l => {
            const points = l.d.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];
            l.d = `M ${points[0] - minX},${points[1]} C ${points[2] - minX},${points[3]} ${points[4] - minX},${points[5]} ${points[6] - minX},${points[7]}`;
        });

        return {
            nodesToRender: nodes,
            linesToRender: lines,
            treeDimensions: { width: maxX - minX, height: maxY },
        };
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

    useEffect(() => {
        centerView();
    }, [isFullScreen, treeDimensions.width, centerView]);

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('.node-wrapper')) return;
        e.preventDefault();
        setIsDragging(true);
        setStartPos({ x: e.clientX, y: e.clientY });
        setInitialTransform({ x: transform.x, y: transform.y });
    };

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        const dx = e.clientX - startPos.x;
        const dy = e.clientY - startPos.y;
        setTransform(prev => ({ ...prev, x: initialTransform.x + dx, y: initialTransform.y + dy }));
    };

    const handleMouseUpOrLeave = () => setIsDragging(false);

    const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        handleZoom(e.deltaY < 0 ? 'in' : 'out', e.clientX, e.clientY);
    };

    const handleZoom = (direction: 'in' | 'out', clientX?: number, clientY?: number) => {
        const container = containerRef.current;
        if (!container) return;

        const zoomFactor = 1.2;
        const newScale = direction === 'in' ? transform.scale * zoomFactor : transform.scale / zoomFactor;
        const clampedScale = Math.max(0.2, Math.min(2.0, newScale));

        if (clampedScale === transform.scale) return;

        const rect = container.getBoundingClientRect();
        const mouseX = clientX ? clientX - rect.left : rect.width / 2;
        const mouseY = clientY ? clientY - rect.top : rect.height / 2;

        const contentX = (mouseX - transform.x) / transform.scale;
        const contentY = (mouseY - transform.y) / transform.scale;

        const newX = mouseX - contentX * clampedScale;
        const newY = mouseY - contentY * clampedScale;

        setTransform({ scale: clampedScale, x: newX, y: newY });
    };

    const handleNodeClick = (node: NetworkNode) => { if (!node.isEmpty) setSelectedNode(node); };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        const flatResults: NetworkNode[] = [];
        const traverse = (node: NetworkNode) => {
            if (!node || node.isEmpty) return;
            if (node.name?.toLowerCase().includes(query.toLowerCase())) {
                flatResults.push(node);
            }
            if (node.children) node.children.forEach(traverse);
        };
        traverse(rootNode);
        setSearchResults(flatResults);
        setShowSearchResults(true);
    };

    const focusNode = (node: NetworkNode) => {
        setShowSearchResults(false);
        setSearchQuery(node.name || '');

        const targetNode = nodesToRender.find(n => n.node.id === node.id);
        if (targetNode && containerRef.current) {
            const x = parseFloat(targetNode.style.transform!.toString().match(/translate\(([-0-9.]+)px/)![1]);
            const y = parseFloat(targetNode.style.transform!.toString().match(/, ([-0-9.]+)px\)/)![1]);

            const containerWidth = containerRef.current.clientWidth;
            const containerHeight = containerRef.current.clientHeight;

            setTransform({
                scale: 1,
                x: (containerWidth / 2) - (x + NODE_WIDTH / 2),
                y: (containerHeight / 2) - (y + NODE_HEIGHT / 2)
            });
        }
    };

    const containerClasses = isFullScreen ? 'fixed inset-0 z-[100] flex flex-col bg-brand-dark' : 'h-[600px] w-full flex flex-col relative z-10';

    return (
        <div className={containerClasses}>
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4 px-2">
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <IconZoomIn size={16} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar na rede..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full bg-brand-gray-dark border border-brand-gray-light rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:border-brand-gold outline-none text-sm transition-all"
                    />
                    {showSearchResults && searchResults.length > 0 && (
                        <div className="absolute mt-1 w-full bg-brand-gray-dark border border-brand-gray-light rounded-lg shadow-2xl max-h-60 overflow-y-auto z-[110]">
                            {searchResults.map(r => (
                                <button
                                    key={r.id}
                                    onClick={() => focusNode(r)}
                                    className="w-full px-4 py-3 text-left hover:bg-brand-gray-light border-b border-brand-gray last:border-0 flex items-center space-x-3 transition-colors"
                                >
                                    <img src={r.avatarUrl || '/img/default-avatar.png'} alt="" className="w-8 h-8 rounded-full border border-brand-gold/30" />
                                    <div>
                                        <p className="text-sm font-bold text-white leading-none">{r.name}</p>
                                        <p className="text-xs text-gray-400 mt-1">{r.pin}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                onMouseMove={handleMouseMove}
                onWheel={handleWheel}
                className={`flex-grow p-4 bg-brand-dark/50 border border-brand-gray-light text-center overflow-hidden select-none relative rounded-lg ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                    <button onClick={centerView} title="Centralizar" className="control-button"><IconRepeat size={20} /></button>
                    <button onClick={() => setIsFullScreen(!isFullScreen)} title="Tela Cheia" className="control-button">{isFullScreen ? <IconMinimize size={20} /> : <IconMaximize size={20} />}</button>
                    <button onClick={() => handleZoom('in')} title="Aumentar Zoom" className="control-button"><IconZoomIn size={20} /></button>
                    <button onClick={() => handleZoom('out')} title="Diminuir Zoom" className="control-button"><IconZoomOut size={20} /></button>
                </div>

                <div className="w-full h-full" style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0' }}>
                    <div className="relative" style={{ width: treeDimensions.width, height: treeDimensions.height }}>
                        <svg className="absolute inset-0 pointer-events-none overflow-visible">
                            {linesToRender.map(line => (
                                <path key={line.key} d={line.d} stroke="#4A5568" strokeWidth="2" fill="none" className="transition-all duration-500 ease-in-out" />
                            ))}
                        </svg>
                        {nodesToRender.map(({ node, style }) => (
                            <Node
                                key={node.id}
                                node={node}
                                style={style}
                                isExpanded={expandedNodes.has(node.id)}
                                hasChildren={node.children && node.children.length > 0}
                                onToggle={() => handleToggleExpand(node.id)}
                                onClick={handleNodeClick}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <Modal isOpen={!!selectedNode} onClose={() => setSelectedNode(null)} title="Detalhes do Consultor">
                {selectedNode && (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <img src={selectedNode.avatarUrl || '/img/default-avatar.png'} alt={selectedNode.name} className="h-20 w-20 rounded-full border-4 border-brand-gray-light" />
                            <div>
                                <h3 className="text-xl font-bold text-white">{selectedNode.name}</h3>
                                <p className="font-semibold" style={{ color: pinColorMap[selectedNode.pin || 'Iniciante']?.iconColor || '#9ca3af' }}>{selectedNode.pin}</p>
                            </div>
                        </div>
                        <div className="p-4 bg-brand-gray-light rounded-lg space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Status:</span>
                                <span className={`font-semibold ${statusMap[(selectedNode.status || 'inactive').toLowerCase().includes('ativ') ? 'active' : 'inactive'].color}`}>
                                    {(selectedNode.status || 'Inativo')}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
            <style>{`
                .control-button {
                    height: 40px;
                    width: 40px;
                    background-color: rgba(30, 30, 30, 0.8);
                    backdrop-filter: blur(4px);
                    color: white;
                    border-radius: 9999px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    transition: all 0.2s ease;
                }
                .control-button:hover {
                    background-color: #FFD700;
                    color: #121212;
                }
            `}</style>
        </div>
    );
};

export default NetworkTree;
