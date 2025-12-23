
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { User, ChatMessage, MonthlySummary, Order, Product, TrafficSpend, Lead, Customer, Cart, Checkout, AbandonmentLog, MessageTemplate, Supplier, AppAlert } from '../types';
import { Send, Bot, User as UserIcon, Loader2, Zap, BarChart2, DollarSign, ShoppingBag, AlertOctagon, Terminal, ExternalLink, HelpCircle, MessageCircle, ArrowRight, ShieldAlert, CheckCircle, XCircle, Clock, Plus, Trash2 } from 'lucide-react';
import { aiDataService, aiActionService, aiMemoryService, AIContext, AIActionContext } from '../services/aiDataService';
import { AIExecutor } from '../services/aiExecutor';

interface AICopilotProps {
    currentUser: User;
    monthlySummary: MonthlySummary;
    orders: Order[];
    products: Product[];
    traffic: TrafficSpend[];
    leads: Lead[];
    customers: Customer[];
    carts: Cart[];
    checkouts: Checkout[];
    abandonmentLogs: AbandonmentLog[];
    templates?: MessageTemplate[];
    suppliers?: Supplier[]; 
    alerts?: AppAlert[]; // PRT-030 Proactive Alerts
    onNavigate: (tab: string, params?: any) => void;
    onUpdateProduct: (p: Product) => void;
    onUpdateOrder: (o: Order) => void;
    onUpdateAbandonmentLog: (id: string, updates: any) => void;
    onAuditLog?: (action: string, details: string) => void; 
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- TOOL DEFINITIONS ---
const readTools: FunctionDeclaration[] = [
    {
        name: 'navigate',
        description: 'Navegar para uma aba específica do sistema e aplicar filtros se necessário.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                destination: { type: Type.STRING, description: 'ID da aba: dashboard, orders, products, customers, suppliers, recovery, funnel-monitor, traffic, settings.' },
                params: { 
                    type: Type.OBJECT, 
                    description: 'Parâmetros opcionais para deep linking (ex: {id: "123", status: "abandonado", date: "today"})',
                    properties: {
                        id: { type: Type.STRING },
                        status: { type: Type.STRING },
                        date: { type: Type.STRING },
                        type: { type: Type.STRING }
                    }
                }
            },
            required: ['destination'],
        },
    },
    {
        name: 'get_products',
        description: 'Buscar produtos com filtros (mais vendidos, estoque baixo, busca por nome).',
        parameters: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: 'Nome ou parte do nome do produto' },
                sort: { type: Type.STRING, description: 'best_selling, low_stock, or most_revenue' },
                limit: { type: Type.NUMBER, description: 'Quantidade de itens (padrão 5)' }
            }
        }
    },
    {
        name: 'get_orders',
        description: 'Listar pedidos recentes ou filtrar por status.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                status: { type: Type.STRING, description: 'New, Delivered, etc.' },
                period: { type: Type.STRING, description: 'today, week, month' },
                limit: { type: Type.NUMBER }
            }
        }
    },
    {
        name: 'get_marketing_stats',
        description: 'Analisar performance de tráfego (gasto, retorno, ROAS).',
        parameters: {
            type: Type.OBJECT,
            properties: {
                period: { type: Type.STRING, description: 'today, week, month, last_month' }
            }
        }
    },
    {
        name: 'get_financial_metrics',
        description: 'Relatório financeiro detalhado (DRE) para um período.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                period: { type: Type.STRING, description: 'today, week, month, last_month' }
            }
        }
    },
    {
        name: 'get_supplier_metrics',
        description: 'Analisar performance de fornecedores (prazo de entrega e devoluções).',
        parameters: {
            type: Type.OBJECT,
            properties: {
                sort_by: { type: Type.STRING, description: "'shipping_time' (pior prazo) ou 'returns' (mais devoluções)" }
            }
        }
    },
    {
        name: 'list_abandoned_carts',
        description: 'Listar carrinhos abandonados com detalhes (filtro por valor, periodo).',
        parameters: {
            type: Type.OBJECT,
            properties: {
                min_value: { type: Type.NUMBER, description: 'Valor mínimo do carrinho' },
                limit: { type: Type.NUMBER, description: 'Limite de registros (padrão 10)' },
                period: { type: Type.STRING, description: 'today, week, month' }
            }
        }
    },
    {
        name: 'analyze_abandonment',
        description: 'Analisar padrões de abandono (quais produtos são mais abandonados, clientes recorrentes).',
        parameters: {
            type: Type.OBJECT,
            properties: {
                type: { type: Type.STRING, description: "'products' (produtos mais abandonados) ou 'customers' (clientes recorrentes)" }
            },
            required: ['type']
        }
    }
];

const actionTools: FunctionDeclaration[] = [
    {
        name: 'update_product',
        description: 'Atualizar preço, estoque ou status de um produto.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                name_or_sku: { type: Type.STRING, description: 'Nome exato ou SKU do produto' },
                field: { type: Type.STRING, description: 'price, stock, status' },
                value: { type: Type.STRING, description: 'Novo valor (número ou Active/Inactive)' }
            },
            required: ['name_or_sku', 'field', 'value']
        }
    },
    {
        name: 'update_order_status',
        description: 'Alterar o status de um pedido (ex: marcar como Enviado).',
        parameters: {
            type: Type.OBJECT,
            properties: {
                order_id: { type: Type.STRING, description: 'ID do pedido' },
                new_status: { type: Type.STRING, description: 'New, Packing, Shipped, Delivered' }
            },
            required: ['order_id', 'new_status']
        }
    },
    {
        name: 'send_recovery_message',
        description: 'Enviar mensagem de recuperação (WhatsApp) para carrinhos abandonados.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                target: { type: Type.STRING, description: "'single' (um específico), 'bulk_cart' (todos carrinhos), 'bulk_checkout' (todos checkouts)" },
                id: { type: Type.STRING, description: 'ID do log de abandono (se target=single)' },
                period: { type: Type.STRING, description: 'Periodo para bulk (today, week)' }
            },
            required: ['target']
        }
    }
];

export const AICopilot: React.FC<AICopilotProps> = ({ 
    currentUser, monthlySummary, orders, products, traffic, leads, customers, carts, checkouts, abandonmentLogs, templates, suppliers, alerts,
    onNavigate, onUpdateProduct, onUpdateOrder, onUpdateAbandonmentLog, onAuditLog
}) => {
    // --- STATE ---
    const [sessionId, setSessionId] = useState<string>(crypto.randomUUID());
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'welcome', role: 'model', content: `Olá, ${currentUser.name}! Sou o RS.AI, seu Copiloto de E-commerce. 🚀\n\nEstou monitorando **${orders.length}** pedidos e **${products.length}** produtos.\nComo posso te ajudar hoje?`, timestamp: new Date().toISOString() }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ tool: string, args: any } | null>(null);
    const [sessions, setSessions] = useState(aiMemoryService.getUserContext(currentUser.id).sessions);
    
    // Proactive Alert Tracking
    const notifiedAlertsRef = useRef<Set<string>>(new Set());

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        // Auto-save session on change
        if (messages.length > 1) {
            aiMemoryService.saveSession(currentUser.id, messages);
            setSessions(aiMemoryService.getUserContext(currentUser.id).sessions);
        }
    }, [messages, currentUser.id]);

    // --- PROACTIVE ALERTS CHECK ---
    useEffect(() => {
        if (!alerts) return;
        
        const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL');
        criticalAlerts.forEach(alert => {
            if (!notifiedAlertsRef.current.has(alert.id)) {
                // Add system message
                setMessages(prev => [...prev, {
                    id: crypto.randomUUID(),
                    role: 'system' as any,
                    content: `⚠️ **ALERTA CRÍTICO DETECTADO:** ${alert.title}\n${alert.message}\nDeseja que eu analise isso?`,
                    timestamp: new Date().toISOString()
                }]);
                notifiedAlertsRef.current.add(alert.id);
            }
        });
    }, [alerts]);

    // --- HANDLERS ---

    const handleNewSession = () => {
        setSessionId(crypto.randomUUID());
        setMessages([
            { id: 'welcome', role: 'model', content: `Nova sessão iniciada. Em que posso focar agora?`, timestamp: new Date().toISOString() }
        ]);
    };

    const handleLoadSession = (session: any) => {
        setSessionId(session.id);
        setMessages(session.messages);
    };

    const generateWhatsAppLink = (logId: string) => {
        const log = abandonmentLogs.find(l => l.id === logId);
        if (!log || !log.contact) return null;
        
        const template = templates ? templates[0] : { content: "Olá {nome}, vi que esqueceu itens no carrinho. Vamos finalizar?" };
        
        const phone = log.contact.replace(/\D/g, '');
        const firstName = log.customerName?.split(' ')[0] || 'Cliente';
        const productList = log.itemsSummary.map(item => `${item.quantity}x ${item.name}`).join(', ');
        const totalValue = `R$ ${log.value.toFixed(2)}`;
        const checkoutLink = `https://seusite.com/recuperar/${log.referenceId}`; 

        let message = template.content
            .replace(/{nome}/g, firstName)
            .replace(/{lista_produtos}/g, productList)
            .replace(/{valor_total}/g, totalValue)
            .replace(/{link_checkout}/g, checkoutLink);

        return `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    };

    const handleQuickAction = (action: string, payload: any) => {
        if (action === 'send_whatsapp') {
            const link = generateWhatsAppLink(payload.id);
            if (link) {
                window.open(link, '_blank');
                onUpdateAbandonmentLog(payload.id, { recoveryStatus: 'em_contato' });
                aiMemoryService.addAction(currentUser.id, 'send_whatsapp', `Sent recovery for cart ${payload.id}`);
                setMessages(prev => [...prev, {
                    id: crypto.randomUUID(),
                    role: 'system' as any,
                    content: `Mensagem enviada para ${payload.customer || 'Cliente'}!`,
                    timestamp: new Date().toISOString(),
                    isAction: true
                }]);
            } else {
                alert("Erro ao gerar link. Verifique o contato.");
            }
        }
    };

    const handleConfirmAction = async (confirmed: boolean) => {
        if (!pendingAction) return;
        
        if (!confirmed) {
            setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'model', content: "Ação cancelada pelo usuário.", timestamp: new Date().toISOString() }]);
            setPendingAction(null);
            return;
        }

        setIsLoading(true);
        const aiContext: AIContext = { 
            orders, products, traffic, carts, checkouts, abandonmentLogs, templates, suppliers,
            userId: currentUser.id, userRole: currentUser.role 
        };
        const actionContext: AIActionContext = { updateProduct: onUpdateProduct, updateOrder: onUpdateOrder, updateAbandonmentLog: onUpdateAbandonmentLog };

        const result = await AIExecutor.execute(
            pendingAction.tool, 
            pendingAction.args, 
            aiContext, 
            actionContext, 
            currentUser, 
            true, 
            (action, details) => onAuditLog && onAuditLog(action, details)
        );

        setMessages(prev => [...prev, { 
            id: crypto.randomUUID(), 
            role: 'model', 
            content: result.message, 
            timestamp: new Date().toISOString(),
            isAction: result.success
        }]);
        
        setPendingAction(null);
        setIsLoading(false);
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading || pendingAction) return;

        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: input,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        const userMemory = aiMemoryService.getUserContext(currentUser.id);
        const aiContext: AIContext = { 
            orders, products, traffic, carts, checkouts, abandonmentLogs, templates, suppliers,
            userId: currentUser.id, userRole: currentUser.role
        };
        const actionContext: AIActionContext = { updateProduct: onUpdateProduct, updateOrder: onUpdateOrder, updateAbandonmentLog: onUpdateAbandonmentLog };

        try {
            const systemInstruction = `
            Você é o RS.AI, um consultor e analista de dados SÊNIOR para E-commerce (Dropshipping).
            CONTEXTO:
            - Tópicos Recentes: ${userMemory.recentTopics.join(', ')}
            - Últimas Ações: ${JSON.stringify(userMemory.lastActions.slice(0, 2))}
            
            MISSÃO: Analisar, Diagnosticar e EXECUTAR.
            SEGURANÇA: Se você for usar uma ferramenta de alteração (update, send), APENAS CHAME A TOOL. O sistema cuidará da confirmação.
            
            DIRETRIZES:
            - Responda em Português (PT-BR) de forma executiva.
            - Use Markdown.
            - Use Tools para buscar dados.
            `;
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [
                    ...messages.map(m => ({ role: m.role === 'system' ? 'model' : m.role, parts: [{ text: m.content }] })),
                    { role: 'user', parts: [{ text: input }] }
                ],
                config: {
                    systemInstruction: systemInstruction,
                    tools: [{ functionDeclarations: [...readTools, ...actionTools] }]
                }
            });

            const functionCalls = response.functionCalls;
            let finalResponseText = response.text || "";
            
            if (functionCalls && functionCalls.length > 0) {
                for (const call of functionCalls) {
                    const { name, args } = call;
                    let result: any = {};
                    let displayMessage = "";
                    let isAction = false;
                    let uiType: 'default' | 'recovery_list' = 'default';
                    let uiData: any = null;

                    aiMemoryService.addTopic(currentUser.id, name);

                    if (name === 'navigate') {
                        onNavigate((args as any).destination, (args as any).params);
                        displayMessage = `Redirecionando para **${(args as any).destination}**...`;
                        isAction = true;
                    }
                    else if (['get_products', 'get_orders', 'list_abandoned_carts', 'analyze_abandonment', 'get_marketing_stats', 'get_financial_metrics', 'get_supplier_metrics'].includes(name)) {
                        if (name === 'list_abandoned_carts') {
                            result = aiDataService.listAbandonedCarts(aiContext, args as any);
                            displayMessage = `Encontrei **${result.length}** carrinhos que precisam de atenção.`;
                            uiType = 'recovery_list';
                            uiData = result;
                        } else {
                            // @ts-ignore
                            result = aiDataService[name === 'get_products' ? 'getProducts' : name === 'get_orders' ? 'getOrders' : name === 'analyze_abandonment' ? 'analyzeAbandonment' : name === 'get_marketing_stats' ? 'getMarketingStats' : name === 'get_financial_metrics' ? 'getFinancialMetrics' : 'getSupplierMetrics'](aiContext, args as any);
                            displayMessage = "Dados obtidos.";
                        }
                    }
                    else {
                        // ACTION TOOLS
                        const execResult = await AIExecutor.execute(
                            name, 
                            args, 
                            aiContext, 
                            actionContext, 
                            currentUser, 
                            false,
                            (a, d) => onAuditLog && onAuditLog(a, d)
                        );

                        if (execResult.requiresConfirmation) {
                            setPendingAction({ tool: name, args: args });
                            setMessages(prev => [...prev, { 
                                id: crypto.randomUUID(), 
                                role: 'model', 
                                content: execResult.message, 
                                timestamp: new Date().toISOString() 
                            }]);
                            setIsLoading(false);
                            return; 
                        }

                        result = execResult;
                        displayMessage = execResult.message;
                        isAction = execResult.success;
                        if (isAction) aiMemoryService.addAction(currentUser.id, name, JSON.stringify(args));
                    }

                    // Feed result back for summary
                    const interpretationResponse = await ai.models.generateContent({
                        model: "gemini-2.5-flash",
                        contents: [
                            { role: 'user', parts: [{ text: `Tool '${name}' output: ${JSON.stringify(result)}. Summarize in PT-BR.` }] }
                        ]
                    });
                    
                    finalResponseText = interpretationResponse.text || displayMessage;

                    if (uiType === 'recovery_list') {
                        setMessages(prev => [
                            ...prev, 
                            { id: crypto.randomUUID(), role: 'model', content: finalResponseText, timestamp: new Date().toISOString() },
                            { id: crypto.randomUUID(), role: 'system' as any, content: '', timestamp: new Date().toISOString(), uiType: 'recovery_list', data: uiData }
                        ]);
                        setIsLoading(false);
                        return;
                    }
                }
            } 
            
            const aiMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'model',
                content: finalResponseText,
                timestamp: new Date().toISOString(),
                isAction: (functionCalls?.length || 0) > 0
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'model', content: "Desculpe, ocorreu um erro de conexão.", timestamp: new Date().toISOString() }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-100px)] gap-4 animate-fade-in">
            
            {/* --- LEFT SIDEBAR (HISTORY) --- */}
            <div className="w-64 bg-rs-card border border-rs-goldDim/20 rounded-xl overflow-hidden flex flex-col hidden md:flex">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Histórico</span>
                    <button onClick={handleNewSession} className="p-1 hover:bg-white/10 rounded text-rs-gold" title="Nova Conversa">
                        <Plus size={16}/>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {sessions.map(sess => (
                        <button 
                            key={sess.id}
                            onClick={() => handleLoadSession(sess)}
                            className={`w-full text-left p-3 rounded-lg text-xs truncate transition-colors ${sessionId === sess.id ? 'bg-rs-gold/10 text-rs-gold border border-rs-gold/20' : 'text-slate-400 hover:bg-white/5'}`}
                        >
                            <div className="font-bold mb-1">{sess.title}</div>
                            <div className="text-[10px] opacity-70 flex items-center gap-1"><Clock size={10}/> {new Date(sess.date).toLocaleDateString()}</div>
                        </button>
                    ))}
                    {sessions.length === 0 && <div className="text-center text-xs text-slate-600 p-4">Sem histórico recente.</div>}
                </div>
            </div>

            {/* --- MAIN CHAT AREA --- */}
            <div className="flex-1 flex flex-col bg-rs-card border border-rs-goldDim/20 rounded-xl overflow-hidden shadow-2xl relative">
                {/* Header */}
                <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-900/20 to-black flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 border border-purple-500/30">
                        <Bot size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">RS.AI Copiloto <span className="text-[10px] bg-rs-gold text-black px-1.5 rounded font-bold uppercase">Pro</span></h2>
                        <p className="text-xs text-slate-400">Inteligência conectada e proativa.</p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-black/20">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {msg.role !== 'system' && (
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-rs-gold text-black border-rs-gold' : 'bg-purple-900/50 text-purple-300 border-purple-500/30'}`}>
                                        {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                                    </div>
                                )}
                                
                                <div className="flex flex-col gap-2 w-full">
                                    {/* Bubble */}
                                    {!msg.uiType && (
                                        <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                                            msg.isAction 
                                                ? 'bg-transparent border border-rs-gold/50 text-rs-gold font-mono' 
                                                : msg.role === 'user' 
                                                    ? 'bg-rs-gold/10 text-slate-200 border border-rs-gold/20 rounded-tr-none' 
                                                    : msg.role === 'system' 
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-full text-center py-2'
                                                        : 'bg-white/5 text-slate-300 border border-white/10 rounded-tl-none'
                                        }`}>
                                            {msg.isAction && <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider border-b border-rs-gold/20 pb-1"><Zap size={12}/> Ação Executada</div>}
                                            {msg.content}
                                        </div>
                                    )}

                                    {/* Rich UI: Recovery List */}
                                    {msg.uiType === 'recovery_list' && msg.data && (
                                        <div className="w-full bg-white/5 rounded-xl border border-white/10 overflow-hidden shadow-lg animate-fade-in">
                                            <div className="bg-orange-500/10 p-3 border-b border-orange-500/20 flex items-center gap-2">
                                                <AlertOctagon size={16} className="text-orange-400"/>
                                                <span className="text-xs font-bold text-orange-200 uppercase tracking-wider">Oportunidades de Recuperação</span>
                                            </div>
                                            <div className="divide-y divide-white/5 max-h-60 overflow-y-auto custom-scrollbar">
                                                {(msg.data as any[]).map((item: any, idx: number) => (
                                                    <div key={idx} className="p-3 flex justify-between items-center hover:bg-white/5 transition-colors group">
                                                        <div>
                                                            <div className="font-bold text-slate-200 text-sm">{item.customer}</div>
                                                            <div className="text-xs text-slate-500">{item.items}</div>
                                                            <div className="text-xs font-bold text-rs-gold mt-1">R$ {item.value.toFixed(2)}</div>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleQuickAction('send_whatsapp', item)}
                                                            className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 p-2 rounded-lg transition-colors flex items-center gap-2"
                                                            title="Enviar WhatsApp Agora"
                                                        >
                                                            <span className="text-[10px] font-bold uppercase hidden group-hover:block">Enviar</span>
                                                            <MessageCircle size={18}/>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-2 bg-black/20 text-center border-t border-white/5">
                                                <button onClick={() => onNavigate('recovery')} className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 transition-colors">
                                                    Ver todos na aba Recuperação <ArrowRight size={12}/>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Security Confirmation */}
                    {pendingAction && (
                        <div className="flex justify-start animate-fade-in">
                            <div className="max-w-[85%] flex gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-red-900/50 text-red-300 border-red-500/30">
                                    <ShieldAlert size={16} />
                                </div>
                                <div className="bg-red-950/30 border border-red-500/30 rounded-2xl rounded-tl-none p-4 w-full shadow-lg">
                                    <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2 text-sm uppercase tracking-wider"><ShieldAlert size={16}/> Confirmação de Segurança</h4>
                                    <p className="text-sm text-slate-300 mb-4 bg-black/20 p-3 rounded border border-white/5">
                                        A IA solicitou uma ação de risco: <br/>
                                        <span className="font-mono text-xs text-rs-gold block mt-2">{pendingAction.tool}</span>
                                        <span className="block text-xs text-slate-500 mt-1 font-mono">{JSON.stringify(pendingAction.args)}</span>
                                    </p>
                                    <div className="flex gap-3">
                                        <button onClick={() => handleConfirmAction(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors border border-white/5">
                                            <XCircle size={16}/> Cancelar
                                        </button>
                                        <button onClick={() => handleConfirmAction(true)} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-600/20">
                                            <CheckCircle size={16}/> Confirmar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isLoading && !pendingAction && (
                        <div className="flex justify-start animate-fade-in">
                            <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/10 flex items-center gap-3">
                                <Loader2 size={16} className="animate-spin text-purple-400" />
                                <span className="text-xs text-slate-500 typing-effect">Processando solicitação...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10 bg-rs-card">
                    <form onSubmit={handleSendMessage} className="relative">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={pendingAction ? "Confirme a ação acima..." : "Digite sua mensagem (ex: 'Recuperar carrinhos de hoje')"}
                            disabled={!!pendingAction}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-200 focus:border-purple-500/50 outline-none transition-all disabled:opacity-50"
                        />
                        <button 
                            type="submit" 
                            disabled={!input.trim() || isLoading || !!pendingAction}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                    <div className="mt-3 flex gap-2 overflow-x-auto text-[10px] text-slate-500 pb-1 scrollbar-hide">
                        <SuggestionChip icon={<AlertOctagon size={12}/>} text="Carrinhos > R$100" onClick={() => setInput("Listar carrinhos abandonados acima de 100 reais")} />
                        <SuggestionChip icon={<ShoppingBag size={12}/>} text="Mais Abandonados" onClick={() => setInput("Quais produtos são mais abandonados?")} />
                        <SuggestionChip icon={<DollarSign size={12}/>} text="Lucro da Semana" onClick={() => setInput("Qual o lucro líquido desta semana?")} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const SuggestionChip = ({ icon, text, onClick }: any) => (
    <button onClick={onClick} className="flex items-center gap-1.5 hover:text-purple-400 whitespace-nowrap border border-white/10 bg-white/5 px-3 py-1.5 rounded-full transition-colors hover:border-purple-500/30">
        {icon} {text}
    </button>
);
