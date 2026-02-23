

import React, { FC, useState, useRef, MouseEvent, DragEvent, useCallback, ChangeEvent, useEffect, WheelEvent } from 'react';
import {
  IconChevronLeft, IconSave, IconPlus, IconTrash, IconUser, IconCalendar, IconLink,
  IconWhatsapp, IconFacebook, IconSparkles, IconEdit, IconMove, IconMinus, IconYoutube,
  IconTikTok, IconGoogle, IconFileClock, IconGitFork, IconSend, IconPlay, IconChevronRight, 
  IconMaximize, IconMinimize, IconActive, IconChevronDown, IconBot, IconShoppingCart, IconAward,
  IconLinkedin, IconRepeat, IconAlertTriangle
} from '../../components/icons';
import type { Workflow, WorkflowNode, WorkflowEdge, WorkflowNodeType, WorkflowNodeParameter, WorkflowNodeOutput } from '../../types';
import { useLayout } from '../../App';


const NODE_WIDTH = 240;
const NODE_HEIGHT = 72;

// --- CONFIGURAÇÃO DOS NÓS ---
const NODE_CONFIG: Record<WorkflowNodeType, { icon: React.ElementType; color: string; category: 'start' | 'triggers' | 'actions' | 'logic' | 'intelligence'; defaultParams: WorkflowNodeParameter[], outputs?: WorkflowNodeOutput[] }> = {
    // Início
    start: { icon: IconPlay, color: 'bg-gray-700', category: 'start', defaultParams: [{ name: 'start', label: 'Início', type: 'readonly', value: 'O ponto de partida da automação.' }] },
    // Gatilhos
    newUser: { icon: IconUser, color: 'bg-sky-500', category: 'triggers', defaultParams: [{ name: 'trigger', label: 'Gatilho', type: 'readonly', value: 'Dispara quando um novo consultor se cadastra.' }], outputs: [{ name: 'trigger.newUser.name', label: 'Nome do Novo Indicado' }, { name: 'trigger.newUser.email', label: 'Email do Novo Indicado' }] },
    schedule: { icon: IconCalendar, color: 'bg-sky-500', category: 'triggers', defaultParams: [{ name: 'cron', label: 'Quando', type: 'text', value: 'Toda Sexta-feira às 10:00' }], outputs: [{ name: 'trigger.schedule.timestamp', label: 'Data/Hora do Agendamento' }] },
    webhook: { icon: IconLink, color: 'bg-sky-500', category: 'triggers', defaultParams: [{ name: 'url', label: 'URL do Webhook', type: 'readonly', value: 'https://api.rsprolipsi.com/webhook/...' }], outputs: [{ name: 'trigger.webhook.body', label: 'Corpo da Requisição' }] },
    newSale: { icon: IconShoppingCart, color: 'bg-sky-500', category: 'triggers', defaultParams: [{ name: 'trigger', label: 'Gatilho', type: 'readonly', value: 'Dispara quando uma nova venda é registrada na RS Shop.' }], outputs: [{ name: 'trigger.sale.productName', label: 'Nome do Produto' }, { name: 'trigger.sale.amount', label: 'Valor da Venda' }] },
    pinAchieved: { icon: IconAward, color: 'bg-sky-500', category: 'triggers', defaultParams: [{ name: 'trigger', label: 'Gatilho', type: 'readonly', value: 'Dispara quando um indicado direto atinge um novo PIN.' }], outputs: [{ name: 'trigger.pin.consultantName', label: 'Nome do Consultor' }, { name: 'trigger.pin.newPin', label: 'Novo PIN' }] },
    birthday: { icon: IconCalendar, color: 'bg-sky-500', category: 'triggers', defaultParams: [{ name: 'trigger', label: 'Gatilho', type: 'readonly', value: 'Dispara no aniversário de um indicado direto.' }], outputs: [{ name: 'trigger.birthday.consultantName', label: 'Nome do Aniversariante' }] },
    // Ações
    whatsappMessage: { icon: IconWhatsapp, color: 'bg-emerald-500', category: 'actions', defaultParams: [{ name: 'message', label: 'Mensagem', type: 'textarea', value: 'Olá! Bem-vindo(a) à RS Prólipsi.' }] },
    instagramPost: { icon: IconFacebook, color: 'bg-emerald-500', category: 'actions', defaultParams: [{ name: 'image_url', label: 'URL da Imagem', type: 'text', value: '' }, { name: 'caption', label: 'Legenda', type: 'textarea', value: '' }] },
    facebookPost: { icon: IconFacebook, color: 'bg-emerald-500', category: 'actions', defaultParams: [{ name: 'image_url', label: 'URL da Imagem', type: 'text', value: '' }, { name: 'message', label: 'Mensagem', type: 'textarea', value: '' }] },
    tiktokPost: { icon: IconTikTok, color: 'bg-emerald-500', category: 'actions', defaultParams: [{ name: 'video_url', label: 'URL do Vídeo', type: 'text', value: '' }, { name: 'caption', label: 'Legenda', type: 'textarea', value: '' }] },
    youtubeVideo: { icon: IconYoutube, color: 'bg-emerald-500', category: 'actions', defaultParams: [{ name: 'video_url', label: 'URL do Vídeo', type: 'text', value: '' }, { name: 'title', label: 'Título', type: 'text', value: '' }, { name: 'description', label: 'Descrição', type: 'textarea', value: '' }] },
    sendEmail: { icon: IconSend, color: 'bg-emerald-500', category: 'actions', defaultParams: [{ name: 'subject', label: 'Assunto', type: 'text', value: '' }, { name: 'body', label: 'Corpo do Email', type: 'textarea', value: '' }] },
    googleSheetAddRow: { icon: IconGoogle, color: 'bg-emerald-500', category: 'actions', defaultParams: [{ name: 'sheet_url', label: 'URL da Planilha', type: 'text', value: '' }, { name: 'data', label: 'Dados (JSON)', type: 'textarea', value: '{}' }] },
    discordMessage: { icon: IconSparkles, color: 'bg-emerald-500', category: 'actions', defaultParams: [{ name: 'webhook_url', label: 'URL do Webhook Discord', type: 'text', value: '' }, { name: 'message', label: 'Mensagem', type: 'textarea', value: '' }] },
    linkedInPost: { icon: IconLinkedin, color: 'bg-emerald-500', category: 'actions', defaultParams: [{ name: 'content', label: 'Conteúdo', type: 'textarea', value: '' }] },
    // Lógica
    delay: { icon: IconFileClock, color: 'bg-amber-500', category: 'logic', defaultParams: [{ name: 'duration', label: 'Duração', type: 'text', value: '5 minutos' }] },
    condition: { icon: IconGitFork, color: 'bg-amber-500', category: 'logic', defaultParams: [{ name: 'condition', label: 'Condição', type: 'text', value: '{{trigger.sale.amount}} > 100' }] },
    loop: { icon: IconRepeat, color: 'bg-amber-500', category: 'logic', defaultParams: [{ name: 'list', label: 'Lista de Itens', type: 'text', value: '{{api_result.items}}' }], outputs: [{ name: 'loop.item', label: 'Item Atual' }, { name: 'loop.index', label: 'Índice Atual' }] },
    // IA
    aiAction: { icon: IconSparkles, color: 'bg-violet-500', category: 'intelligence', defaultParams: [{ name: 'prompt', label: 'Prompt para RSIA', type: 'textarea', value: 'Crie uma legenda para o Instagram sobre...' }], outputs: [{ name: 'ai.action.result', label: 'Resultado da IA' }] },
    aiContent: { icon: IconSparkles, color: 'bg-violet-500', category: 'intelligence', defaultParams: [{ name: 'prompt', label: 'Prompt para Geração', type: 'textarea', value: 'Gerar 3 ideias de post sobre marketing de rede' }], outputs: [{ name: 'ai.content.result', label: 'Conteúdo Gerado' }] },
    aiDecision: { icon: IconBot, color: 'bg-violet-500', category: 'intelligence', defaultParams: [{ name: 'prompt', label: 'Prompt para Decisão', type: 'textarea', value: 'Analisar o perfil do lead: {{trigger.newUser.name}}' }, { name: 'options', label: 'Opções (separadas por vírgula)', type: 'text', value: 'Potencial Alto, Potencial Médio, Potencial Baixo' }], outputs: [{ name: 'ai.decision.choice', label: 'Decisão Tomada' }] },

};
const TOOLBOX_ITEMS = Object.entries(NODE_CONFIG).map(([type, config]) => ({ type: type as WorkflowNodeType, label: type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), ...config }));

interface WorkflowBuilderProps {
  workflow: Workflow;
  onClose: () => void;
}

const WorkflowBuilder: FC<WorkflowBuilderProps> = ({ workflow: initialWorkflow, onClose }) => {
    const { layoutMode, setLayoutMode } = useLayout();
    const [workflow, setWorkflow] = useState<Workflow>(initialWorkflow);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initialWorkflow.nodes.length > 0 ? initialWorkflow.nodes[0].id : null);
    const [draggingNode, setDraggingNode] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
    const [saveStatus, setSaveStatus] = useState(false);
    const [connectionLine, setConnectionLine] = useState<{ sourceId: string; sourceHandle: string; x2: number; y2: number } | null>(null);
    const [openToolboxSections, setOpenToolboxSections] = useState(['triggers', 'actions', 'logic', 'intelligence']);
    
    // UI State
    const [isToolboxCollapsed, setIsToolboxCollapsed] = useState(false);
    const [isInspectorCollapsed, setIsInspectorCollapsed] = useState(false);
    
    // Pan & Zoom State
    const [viewTransform, setViewTransform] = useState({ scale: 1, x: 0, y: 0 });
    const [isCanvasDragging, setIsCanvasDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const initialViewTransformOnDrag = useRef({ x: 0, y: 0 });


    const canvasRef = useRef<HTMLDivElement>(null);
    const activeInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
    
    useEffect(() => {
        const handleGlobalMouseMove = (e: globalThis.MouseEvent) => {
            if (isCanvasDragging) {
                const dx = e.clientX - dragStartPos.current.x;
                const dy = e.clientY - dragStartPos.current.y;
                setViewTransform(prev => ({ ...prev, x: initialViewTransformOnDrag.current.x + dx, y: initialViewTransformOnDrag.current.y + dy }));
                return;
            }

            // Node Dragging Logic
            if (draggingNode) {
                setWorkflow(currentWorkflow => {
                    if (!canvasRef.current) return currentWorkflow;
                    const canvasRect = canvasRef.current.getBoundingClientRect();
                    const mouseX = e.clientX - canvasRect.left;
                    const mouseY = e.clientY - canvasRect.top;
                    const contentX = (mouseX - viewTransform.x) / viewTransform.scale;
                    const contentY = (mouseY - viewTransform.y) / viewTransform.scale;
                    const newX = contentX - draggingNode.offsetX;
                    const newY = contentY - draggingNode.offsetY;

                    return {
                        ...currentWorkflow,
                        nodes: currentWorkflow.nodes.map(n =>
                            n.id === draggingNode.id ? { ...n, position: { x: newX, y: newY } } : n
                        )
                    };
                });
            }

            // Connection Line Drawing Logic
            if (connectionLine && canvasRef.current) {
                const canvasRect = canvasRef.current.getBoundingClientRect();
                const mouseX = e.clientX - canvasRect.left;
                const mouseY = e.clientY - canvasRect.top;
                const contentX = (mouseX - viewTransform.x) / viewTransform.scale;
                const contentY = (mouseY - viewTransform.y) / viewTransform.scale;

                setConnectionLine(currentLine => currentLine ? {
                    ...currentLine,
                    x2: contentX,
                    y2: contentY
                } : null);
            }
        };

        const handleGlobalMouseUp = (e: globalThis.MouseEvent) => {
            if (isCanvasDragging) {
                setIsCanvasDragging(false);
            }
            // End Node Dragging
            if (draggingNode) {
                setDraggingNode(null);
            }

            // End Connection Drawing
            if (connectionLine) {
                const targetElement = e.target as HTMLElement;
                const targetNodeWrapper = targetElement.closest('.node-wrapper');
                const targetNodeId = targetNodeWrapper?.getAttribute('data-node-id');

                if (targetNodeId && connectionLine.sourceId !== targetNodeId) {
                    setWorkflow(prevWorkflow => {
                        const edgeExists = prevWorkflow.edges.some(edge =>
                            edge.source === connectionLine.sourceId &&
                            edge.target === targetNodeId &&
                            edge.sourceHandle === connectionLine.sourceHandle
                        );
                        if (!edgeExists) {
                            const newEdge: WorkflowEdge = {
                                id: `e-${connectionLine.sourceId}-${connectionLine.sourceHandle}-${targetNodeId}`,
                                source: connectionLine.sourceId,
                                target: targetNodeId,
                                sourceHandle: connectionLine.sourceHandle,
                            };
                            return { ...prevWorkflow, edges: [...prevWorkflow.edges, newEdge] };
                        }
                        return prevWorkflow;
                    });
                }
                setConnectionLine(null);
            }
        };

        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [draggingNode, connectionLine, isCanvasDragging, viewTransform.scale, viewTransform.x, viewTransform.y]);


    const toggleToolboxSection = (section: string) => {
        setOpenToolboxSections(prev => 
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        );
    };

    const groupedTools = TOOLBOX_ITEMS.reduce((acc, item) => {
        if (item.category === 'start') return acc;
        (acc[item.category] = acc[item.category] || []).push(item);
        return acc;
    }, {} as Record<string, typeof TOOLBOX_ITEMS>);
    
    const categoryNames: Record<string, string> = {
        triggers: 'Gatilhos',
        actions: 'Ações',
        logic: 'Lógica',
        intelligence: 'Inteligência',
    };

    const handleNodeMouseDown = (e: MouseEvent, nodeId: string) => {
        e.stopPropagation();
        const node = workflow.nodes.find(n => n.id === nodeId);
        if (node && canvasRef.current && node.type !== 'start') {
            const nodeElement = (e.currentTarget as HTMLElement).closest('.node-wrapper')!;
            const nodeRect = nodeElement.getBoundingClientRect();
            
            const offsetX = (e.clientX - nodeRect.left) / viewTransform.scale;
            const offsetY = (e.clientY - nodeRect.top) / viewTransform.scale;
            setDraggingNode({ id: nodeId, offsetX, offsetY });
        }
        setSelectedNodeId(nodeId);
    };

    const addNode = (type: WorkflowNodeType, position: {x: number, y: number}) => {
        const config = NODE_CONFIG[type];
        if (!config) {
            console.error(`Attempted to add a node with an invalid type: "${type}"`);
            return null;
        }
        const newNode: WorkflowNode = {
            id: `${type}-${Date.now()}`,
            type,
            label: TOOLBOX_ITEMS.find(item => item.type === type)?.label || 'Novo Nó',
            position,
            parameters: JSON.parse(JSON.stringify(config.defaultParams)),
            outputs: config.outputs,
        };
        setWorkflow(prev => ({...prev, nodes: [...prev.nodes, newNode]}));
        return newNode;
    };
    
    const handleDragOver = (e: DragEvent) => e.preventDefault();
    const handleDrop = (e: DragEvent) => {
        if (!canvasRef.current) return;
        const type = e.dataTransfer.getData('application/reactflow') as WorkflowNodeType;
        if (!type) {
            return;
        }
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - canvasRect.left;
        const mouseY = e.clientY - canvasRect.top;
        const contentX = (mouseX - viewTransform.x) / viewTransform.scale;
        const contentY = (mouseY - viewTransform.y) / viewTransform.scale;
        addNode(type, { x: contentX - (NODE_WIDTH / 2), y: contentY - (NODE_HEIGHT / 2) });
    };
    
    const handleParamChange = (nodeId: string, paramName: string, value: string) => {
        setWorkflow(prev => ({...prev, nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, parameters: n.parameters.map(p => p.name === paramName ? {...p, value} : p)} : n)}));
    };
    
    const deleteNode = (nodeId: string) => {
        if (workflow.nodes.find(n => n.id === nodeId)?.type === 'start') return;
        setWorkflow(prev => ({
            ...prev,
            nodes: prev.nodes.filter(n => n.id !== nodeId),
            edges: prev.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
        }));
        if (selectedNodeId === nodeId) {
            const startNode = workflow.nodes.find(n => n.type === 'start');
            setSelectedNodeId(startNode ? startNode.id : null);
        }
    };

    const handleSave = () => {
        console.log("Salvando workflow:", JSON.stringify(workflow, null, 2));
        setSaveStatus(true);
        setTimeout(() => setSaveStatus(false), 2000);
    };
    
    const getAvailableVariables = (nodeId: string) => {
        const available: WorkflowNodeOutput[] = [];
        const visited = new Set<string>();
        let queue = [nodeId];

        while(queue.length > 0) {
            const currentId = queue.shift()!;
            if (visited.has(currentId)) continue;
            visited.add(currentId);
            const incomingEdges = workflow.edges.filter(e => e.target === currentId);
            for (const edge of incomingEdges) {
                const sourceNode = workflow.nodes.find(n => n.id === edge.source);
                if (sourceNode) {
                    if(sourceNode.outputs) available.push(...sourceNode.outputs);
                    queue.push(sourceNode.id);
                }
            }
        }
        return available;
    };
    
    const insertVariable = (variable: string) => {
        if (activeInputRef.current) {
            const { selectionStart, selectionEnd, value, name } = activeInputRef.current;
            const text = `${value.substring(0, selectionStart)}{{${variable}}}${value.substring(selectionEnd)}`;
            if(selectedNodeId) handleParamChange(selectedNodeId, name, text);
            setTimeout(() => {
                if (activeInputRef.current) {
                    const newPos = selectionStart + `{{${variable}}}`.length;
                    activeInputRef.current.focus();
                    activeInputRef.current.setSelectionRange(newPos, newPos);
                }
            }, 0);
        }
    };

    const handleStartConnection = (e: MouseEvent, nodeId: string, handleId: string) => {
        e.stopPropagation();
        e.preventDefault();
        if (canvasRef.current) {
            const canvasRect = canvasRef.current.getBoundingClientRect();
            const mouseX = e.clientX - canvasRect.left;
            const mouseY = e.clientY - canvasRect.top;
            const contentX = (mouseX - viewTransform.x) / viewTransform.scale;
            const contentY = (mouseY - viewTransform.y) / viewTransform.scale;
            setConnectionLine({ sourceId: nodeId, sourceHandle: handleId, x2: contentX, y2: contentY });
        }
    };
    
    const getHandlePosition = (node: WorkflowNode, handleId: string) => {
        const base = { x: node.position.x, y: node.position.y };
        switch (node.type) {
            case 'condition':
            case 'loop':
                if (handleId === 'true' || handleId === 'loop') return { x: base.x + NODE_WIDTH, y: base.y + NODE_HEIGHT * 0.3 };
                if (handleId === 'false' || handleId === 'done') return { x: base.x + NODE_WIDTH, y: base.y + NODE_HEIGHT * 0.7 };
                break;
        }
        if (handleId === 'error') return { x: base.x + NODE_WIDTH / 2, y: base.y + NODE_HEIGHT };
        // Default handle
        return { x: base.x + NODE_WIDTH, y: base.y + NODE_HEIGHT / 2 };
    };

    const validateNode = (node: WorkflowNode): string[] => {
        const errors: string[] = [];
        for (const param of node.parameters) {
            if (param.type !== 'readonly' && !param.value.trim()) {
                errors.push(`O campo "${param.label}" não pode estar vazio.`);
            }
        }
        return errors;
    };

    const handleCanvasMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('.node-wrapper, .param-panel, .toolbox, header, .absolute.top-4.right-4')) {
            return;
        }
        e.preventDefault();
        setIsCanvasDragging(true);
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        initialViewTransformOnDrag.current = { x: viewTransform.x, y: viewTransform.y };
    };

    const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        handleZoom(e.deltaY < 0 ? 'in' : 'out', e.clientX, e.clientY);
    };

    const handleZoom = (direction: 'in' | 'out', clientX?: number, clientY?: number) => {
        const container = canvasRef.current;
        if (!container) return;
        const zoomFactor = 1.2;
        const newScale = direction === 'in' ? viewTransform.scale * zoomFactor : viewTransform.scale / zoomFactor;
        const clampedScale = Math.max(0.25, Math.min(1.5, newScale));
        if (clampedScale === viewTransform.scale) return;
        const rect = container.getBoundingClientRect();
        const mouseX = clientX ? clientX - rect.left : rect.width / 2;
        const mouseY = clientY ? clientY - rect.top : rect.height / 2;
        const contentX = (mouseX - viewTransform.x) / viewTransform.scale;
        const contentY = (mouseY - viewTransform.y) / viewTransform.scale;
        const newX = mouseX - contentX * clampedScale;
        const newY = mouseY - contentY * clampedScale;
        setViewTransform({ scale: clampedScale, x: newX, y: newY });
    };

    const handleResetView = () => setViewTransform({ scale: 1, x: 0, y: 0 });

    const selectedNode = workflow.nodes.find(n => n.id === selectedNodeId);
    const availableVariables = selectedNodeId ? getAvailableVariables(selectedNodeId) : [];
    const selectedNodeErrors = selectedNode ? validateNode(selectedNode) : [];
    const isFullScreen = layoutMode === 'focus';

    return (
        <div className="h-full w-full flex flex-col bg-brand-dark text-white font-sans">
            <header className="flex items-center justify-between p-3 border-b border-brand-gray-light flex-shrink-0">
                <button onClick={onClose} className="flex items-center text-brand-gold font-semibold p-2 rounded-lg hover:bg-brand-gray-light">
                    <IconChevronLeft size={20} className="mr-1"/> Voltar
                </button>
                <div className="text-center">
                    <input type="text" value={workflow.name} onChange={e => setWorkflow(w => ({...w, name: e.target.value}))} className="text-xl font-bold bg-transparent text-center focus:outline-none focus:bg-brand-gray rounded-md"/>
                </div>
                <button onClick={handleSave} className={`font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors ${saveStatus ? 'bg-green-500' : 'bg-brand-gold text-brand-dark hover:bg-yellow-400'}`}>
                    {saveStatus ? <><IconActive size={18}/> Salvo!</> : <><IconSave size={18}/> Salvar e Ativar</>}
                </button>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Toolbox */}
                <aside className={`bg-brand-gray flex-shrink-0 transition-all duration-300 ease-in-out relative ${isToolboxCollapsed ? 'w-10' : 'w-64'}`}>
                     <button onClick={() => setIsToolboxCollapsed(!isToolboxCollapsed)} className="absolute top-1/2 -right-3 -translate-y-1/2 h-10 w-6 bg-brand-gray border-y border-r border-brand-gray-light rounded-r-md flex items-center justify-center hover:bg-brand-gray-light z-20">
                        <IconChevronLeft className={`transition-transform ${isToolboxCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`p-3 overflow-y-auto h-full toolbox ${isToolboxCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                        {Object.entries(groupedTools).map(([category, items]) => (
                            <div key={category} className="mb-2">
                                <button onClick={() => toggleToolboxSection(category)} className="w-full flex justify-between items-center p-2 rounded-lg hover:bg-brand-gray-light">
                                    <h3 className="text-sm font-bold uppercase text-gray-300">{categoryNames[category] || category}</h3>
                                    <IconChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openToolboxSections.includes(category) ? 'rotate-180' : ''}`} />
                                </button>
                                {openToolboxSections.includes(category) && (
                                    <div className="mt-2 space-y-1.5 animate-fade-in">
                                        {items.map(item => (
                                            <div key={item.type} 
                                                className="p-2.5 rounded-lg bg-brand-gray-light flex items-center gap-3 cursor-grab hover:bg-brand-gold hover:text-brand-dark transition-colors group"
                                                onDragStart={(e) => e.dataTransfer.setData('application/reactflow', item.type)}
                                                draggable>
                                                <item.icon className="w-5 h-5 flex-shrink-0 text-brand-gold group-hover:text-brand-dark" />
                                                <span className="text-sm font-semibold">{item.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Canvas */}
                <main ref={canvasRef} className="flex-1 relative bg-brand-dark overflow-hidden cursor-grab active:cursor-grabbing" 
                    onDragOver={handleDragOver} onDrop={handleDrop} onMouseDown={handleCanvasMouseDown} onWheel={handleWheel}>
                    <div className="absolute inset-0 bg-[radial-gradient(#3a3a3a_1px,transparent_1px)] [background-size:20px_20px] opacity-50"></div>
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                        <button onClick={handleResetView} title="Restaurar Visão" className="h-10 w-10 bg-brand-gray-light/80 rounded-full flex items-center justify-center hover:bg-brand-gold hover:text-brand-dark"><IconRepeat/></button>
                        <button onClick={() => handleZoom('in')} title="Aumentar Zoom" className="h-10 w-10 bg-brand-gray-light/80 rounded-full flex items-center justify-center hover:bg-brand-gold hover:text-brand-dark"><IconPlus/></button>
                        <button onClick={() => handleZoom('out')} title="Diminuir Zoom" className="h-10 w-10 bg-brand-gray-light/80 rounded-full flex items-center justify-center hover:bg-brand-gold hover:text-brand-dark"><IconMinus/></button>
                        <button onClick={() => setLayoutMode(isFullScreen ? 'default' : 'focus')} className="h-10 w-10 bg-brand-gray-light/80 rounded-full flex items-center justify-center hover:bg-brand-gold hover:text-brand-dark"><IconMaximize/></button>
                    </div>
                    
                    <div className="absolute top-0 left-0" style={{ transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.scale})`, transformOrigin: '0 0' }}>
                        <svg className="absolute inset-0 w-[10000px] h-[10000px] pointer-events-none" style={{ left: -5000, top: -5000 }}>
                            {workflow.edges.map(edge => {
                                const sourceNode = workflow.nodes.find(n => n.id === edge.source);
                                const targetNode = workflow.nodes.find(n => n.id === edge.target);
                                if (!sourceNode || !targetNode) return null;

                                const {x: x1, y: y1} = getHandlePosition(sourceNode, edge.sourceHandle || 'default');
                                const x2 = targetNode.position.x;
                                const y2 = targetNode.position.y + NODE_HEIGHT / 2;
                                const path = edge.sourceHandle === 'error' 
                                    ? `M ${x1} ${y1} C ${x1} ${y1 + 60}, ${x2 - 60} ${y2}, ${x2} ${y2}`
                                    : `M ${x1} ${y1} C ${x1 + 60} ${y1}, ${x2 - 60} ${y2}, ${x2} ${y2}`;

                                return <path key={edge.id} d={path} stroke="#4a5563" strokeWidth="2" fill="none" className="transition-all duration-150" />;
                            })}
                             {connectionLine && (() => {
                                const sourceNode = workflow.nodes.find(n => n.id === connectionLine.sourceId);
                                if (!sourceNode) return null;
                                const {x: x1, y: y1} = getHandlePosition(sourceNode, connectionLine.sourceHandle);
                                const { x2, y2 } = connectionLine;
                                const path = connectionLine.sourceHandle === 'error'
                                    ? `M ${x1} ${y1} C ${x1} ${y1 + 60}, ${x2 - 60} ${y2}, ${x2} ${y2}`
                                    : `M ${x1} ${y1} C ${x1 + 60} ${y1}, ${x2 - 60} ${y2}, ${x2} ${y2}`;
                                return <path d={path} stroke="#FFD700" strokeWidth="2" fill="none" strokeDasharray="5,5" />;
                            })()}
                        </svg>

                        {workflow.nodes.map(node => {
                            const errors = validateNode(node);
                            return (
                            <div key={node.id}
                                data-node-id={node.id}
                                className={`absolute rounded-xl transition-shadow duration-150 group node-wrapper ${node.type === 'start' ? 'cursor-default' : 'cursor-move'}`}
                                style={{ transform: `translate(${node.position.x}px, ${node.position.y}px)`, width: NODE_WIDTH, boxShadow: selectedNodeId === node.id ? '0 0 0 3px #FFD700, 0 4px 12px rgba(0,0,0,0.5)' : '0 4px 6px rgba(0,0,0,0.4)' }}
                                onMouseDown={(e) => handleNodeMouseDown(e, node.id)} >
                                {errors.length > 0 && <div className="absolute -top-2 -right-2 bg-red-500 rounded-full h-5 w-5 flex items-center justify-center z-20" title={errors.join('\n')}><IconAlertTriangle size={12}/></div>}
                                {NODE_CONFIG[node.type].category !== 'triggers' && node.type !== 'start' && (<div className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-5 h-5 bg-brand-gray border-2 border-gray-500 rounded-full cursor-crosshair hover:border-brand-gold hover:scale-125 transition-transform z-10 node-handle"/>)}
                                <div className="flex items-center gap-3 bg-brand-gray-light p-3 rounded-md">
                                    <div className={`p-2 rounded-md ${NODE_CONFIG[node.type].color}`}><div className="w-6 h-6 flex items-center justify-center">{React.createElement(NODE_CONFIG[node.type].icon, { className: 'text-white', size: 24 })}</div></div>
                                    <h4 className="font-bold text-white flex-1 truncate">{node.label}</h4>
                                </div>
                                
                                {node.type === 'condition' && (<>
                                    <div onMouseDown={(e) => handleStartConnection(e, node.id, 'true')} className="node-handle special-handle" style={{ top: `${NODE_HEIGHT * 0.3}px` }}>Sim</div>
                                    <div onMouseDown={(e) => handleStartConnection(e, node.id, 'false')} className="node-handle special-handle" style={{ top: `${NODE_HEIGHT * 0.7}px` }}>Não</div>
                                </>)}
                                 {node.type === 'loop' && (<>
                                    <div onMouseDown={(e) => handleStartConnection(e, node.id, 'loop')} className="node-handle special-handle" style={{ top: `${NODE_HEIGHT * 0.3}px` }}>Para Cada</div>
                                    <div onMouseDown={(e) => handleStartConnection(e, node.id, 'done')} className="node-handle special-handle" style={{ top: `${NODE_HEIGHT * 0.7}px` }}>Concluído</div>
                                </>)}
                                {NODE_CONFIG[node.type].category === 'actions' && (<div onMouseDown={(e) => handleStartConnection(e, node.id, 'error')} className="node-handle error-handle"><IconAlertTriangle size={12}/></div>)}
                                <div onMouseDown={(e) => handleStartConnection(e, node.id, 'default')} className="node-handle default-handle"><IconPlus size={10}/></div>
                            </div>
                        )})}
                    </div>
                </main>

                {/* Inspector */}
                <aside className={`bg-brand-gray flex-shrink-0 transition-all duration-300 ease-in-out relative ${isInspectorCollapsed ? 'w-10' : 'w-80'}`}>
                     <button onClick={() => setIsInspectorCollapsed(!isInspectorCollapsed)} className="absolute top-1/2 -left-3 -translate-y-1/2 h-10 w-6 bg-brand-gray border-y border-l border-brand-gray-light rounded-l-md flex items-center justify-center hover:bg-brand-gray-light z-20">
                        <IconChevronRight className={`transition-transform ${isInspectorCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`p-4 overflow-y-auto h-full param-panel ${isInspectorCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                        {selectedNode ? (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white mb-4">Parâmetros</h3>
                                {selectedNodeErrors.length > 0 && (
                                    <div className="p-3 bg-red-500/20 text-red-300 rounded-lg text-xs space-y-1">
                                        {selectedNodeErrors.map((error, i) => <p key={i}>⚠️ {error}</p>)}
                                    </div>
                                )}
                                <div><label className="text-sm text-gray-400">Rótulo do Nó</label><input type="text" value={selectedNode.label} onChange={e => setWorkflow(w => ({...w, nodes: w.nodes.map(n => n.id === selectedNodeId ? {...n, label: e.target.value} : n)}))} className="w-full bg-brand-dark p-2 rounded-md border border-brand-gray-light" /></div>
                                {selectedNode.parameters.map(param => (
                                    <div key={param.name}>
                                        <label className="text-sm text-gray-400">{param.label}</label>
                                        <div className="relative">
                                            {param.type === 'textarea' ? (<textarea value={param.value} name={param.name} onChange={e => handleParamChange(selectedNodeId!, param.name, e.target.value)} onFocus={e => activeInputRef.current = e.target} rows={5} className="w-full bg-brand-dark p-2 rounded-md border border-brand-gray-light"/>)
                                            : (<input type={param.type} name={param.name} value={param.value} readOnly={param.type === 'readonly'} onChange={e => handleParamChange(selectedNodeId!, param.name, e.target.value)} onFocus={e => activeInputRef.current = e.target} className={`w-full bg-brand-dark p-2 rounded-md border border-brand-gray-light ${param.type === 'readonly' ? 'opacity-70 cursor-not-allowed' : ''}`} />)}
                                        </div>
                                        {param.description && <p className="text-xs text-gray-500 mt-1">{param.description}</p>}
                                    </div>
                                ))}
                                {availableVariables.length > 0 && (
                                    <div className="pt-4 border-t border-brand-gray-light"><h4 className="text-sm font-bold text-brand-gold mb-2">Variáveis Disponíveis</h4><div className="space-y-1">{availableVariables.map(variable => (<button key={variable.name} onClick={() => insertVariable(variable.name)} title={`Clique para inserir {{${variable.name}}}`} className="w-full text-left text-xs bg-brand-dark p-2 rounded hover:bg-brand-gray-dark flex justify-between items-center"><span>{variable.label}</span><span className="font-mono text-gray-500 opacity-70">clique para inserir</span></button>))}</div></div>
                                )}
                                {selectedNode.type !== 'start' && (<div className="pt-4 border-t border-brand-gray-light space-y-2">
                                    <button onClick={() => alert("Simulando teste para este passo...")} className="w-full text-white bg-sky-600/50 py-2 rounded-lg hover:bg-sky-600/80 flex items-center justify-center gap-2"><IconPlay/> Testar Passo</button>
                                    <button onClick={() => deleteNode(selectedNodeId!)} className="w-full text-red-400 bg-red-500/10 py-2 rounded-lg hover:bg-red-500/20 flex items-center justify-center gap-2"><IconTrash/> Excluir Nó</button>
                                </div>)}
                            </div>
                        ) : (<p className="text-sm text-gray-500 text-center mt-10">Selecione um nó para ver seus parâmetros.</p>)}
                    </div>
                </aside>
            </div>
            <style>{`
                .toolbox::-webkit-scrollbar { width: 4px; }
                .toolbox::-webkit-scrollbar-thumb { background: #4a5563; border-radius: 4px; }
                .param-panel::-webkit-scrollbar { width: 4px; }
                .param-panel::-webkit-scrollbar-thumb { background: #4a5563; border-radius: 4px; }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .node-handle { position: absolute; -translate-y-1/2; width: 20px; height: 20px; background-color: #1E1E1E; border: 2px solid #4a5563; border-radius: 50%; cursor: crosshair; transition: all 0.2s; z-index: 10; display: flex; align-items: center; justify-content: center; }
                .node-handle:hover { border-color: #FFD700; transform: translateY(-50%) scale(1.2); }
                .default-handle { top: 50%; right: -10px; }
                .error-handle { top: 100%; left: 50%; transform: translate(-50%, -50%); color: #4a5563 }
                .error-handle:hover { border-color: #ef4444; color: #ef4444; }
                .special-handle { right: -10px; transform: translateY(-50%); font-size: 9px; font-weight: bold; color: #9ca3af; }
            `}</style>
        </div>
    );
};

export default WorkflowBuilder;