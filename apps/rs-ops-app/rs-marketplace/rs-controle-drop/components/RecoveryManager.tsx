import React, { useState, useMemo, useEffect } from 'react';
import { AbandonmentLog, User, RecoveryStatus, MessageTemplate } from '../types';
import { useCartCheckout } from '../contexts/CartCheckoutContext';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';
import { AlertOctagon, Filter, DollarSign, MessageCircle, Edit, Save, Trash2, ChevronDown, Send, ShieldCheck, ShieldAlert } from 'lucide-react';
import { ModalWrapper } from './ModalWrapper';

interface RecoveryManagerProps {
    currentUser: User;
    users: User[];
    whatsAppTemplates: MessageTemplate[];
    initialFilter?: any; // For deep linking
}

export const RecoveryManager: React.FC<RecoveryManagerProps> = ({ currentUser, users, whatsAppTemplates, initialFilter }) => {
    const { abandonmentLogs, updateAbandonmentLog } = useCartCheckout();
    
    // State for modals
    const [editingLog, setEditingLog] = useState<AbandonmentLog | null>(null);
    const [notes, setNotes] = useState('');

    // State for filters
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [valueFilter, setValueFilter] = useState<string>('all');

    // Handle initial filters (Deep Linking)
    useEffect(() => {
        if (initialFilter) {
            if (initialFilter.status) setStatusFilter(initialFilter.status);
            if (initialFilter.type) setTypeFilter(initialFilter.type);
        }
    }, [initialFilter]);

    // State for template popover
    const [popoverLogId, setPopoverLogId] = useState<string | null>(null);
    
    const filteredLogs = useMemo(() => {
        return abandonmentLogs.filter(log => {
            if (statusFilter !== 'all' && log.recoveryStatus !== statusFilter) return false;
            if (typeFilter !== 'all' && log.type !== typeFilter) return false;
            if (valueFilter !== 'all') {
                const [min, max] = valueFilter.split('-').map(Number);
                if (max) { // Range like 50-150
                    if (log.value < min || log.value > max) return false;
                } else { // Open range like 150+
                    if (log.value < min) return false;
                }
            }
            return true;
        });
    }, [abandonmentLogs, statusFilter, typeFilter, valueFilter]);

    const table = useDataTable({ initialData: filteredLogs, searchKeys: ['customerName', 'contact', 'utmSource', 'utmCampaign'] });

    const handleUpdateStatus = (logId: string, status: RecoveryStatus) => {
        updateAbandonmentLog(logId, { recoveryStatus: status });
    };
    
    const handleOpenNotesModal = (log: AbandonmentLog) => {
        setEditingLog(log);
        setNotes(log.notes || '');
    };
    
    const handleSaveNotes = () => {
        if (editingLog) {
            updateAbandonmentLog(editingLog.id, { notes: notes });
            setEditingLog(null);
            setNotes('');
        }
    };
    
    const timeSince = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " anos";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " meses";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " dias";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " horas";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " min";
        return Math.floor(seconds) + " seg";
    };

    const generateWhatsAppLink = (log: AbandonmentLog, templateContent: string) => {
        if (!log.contact) return '#';

        const phone = log.contact.replace(/\D/g, '');
        const firstName = log.customerName?.split(' ')[0] || 'Cliente';
        const productList = log.itemsSummary.map(item => `${item.quantity}x ${item.name}`).join(', ');
        const mainProduct = log.itemsSummary[0]?.name || 'seu produto';
        const totalValue = `R$ ${log.value.toFixed(2)}`;
        const checkoutLink = `https://seusite.com/recuperar/${log.referenceId}`; // Deep link simulado

        let message = templateContent
            .replace(/{nome}/g, firstName)
            .replace(/{lista_produtos}/g, productList)
            .replace(/{produto_principal}/g, mainProduct)
            .replace(/{valor_total}/g, totalValue)
            .replace(/{link_checkout}/g, checkoutLink);

        return `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    };

    const handleSendWhatsApp = (log: AbandonmentLog, templateContent: string) => {
        const link = generateWhatsAppLink(log, templateContent);
        window.open(link, '_blank');
        if (log.recoveryStatus === 'pendente') {
            handleUpdateStatus(log.id, 'em_contato');
        }
        setPopoverLogId(null);
    };
    
    const getAvailableTemplates = (log: AbandonmentLog) => {
        // LGPD Logic: If no marketing consent, filter out templates that sound like aggressive marketing
        // For simplicity, we assume templates with "bônus" or "oferta" or "desconto" might be marketing.
        // Or if we had a 'type' field in MessageTemplate (as proposed in Types).
        // For now, let's filter based on content keywords if marketing consent is false.
        
        if (log.consents?.marketing) {
            return whatsAppTemplates;
        }
        
        // If no marketing consent, only show transactional-like templates (reminders)
        // Filtering out things that sound explicitly like a new offer
        return whatsAppTemplates.filter(t => {
            const contentLower = t.content.toLowerCase();
            return !contentLower.includes('bônus') && !contentLower.includes('cupom');
        });
    };
    
    const columns: Column<AbandonmentLog>[] = [
        { header: 'Cliente', accessor: 'customerName', render: l => (
            <div>
                <div className="font-bold text-slate-200">{l.customerName || 'Visitante'}</div>
                <div className="text-xs text-slate-500">{l.contact || 'Sem Contato'}</div>
            </div>
        )},
        { header: 'Consentimento', accessor: 'consents', headerClassName: 'text-center', cellClassName: 'text-center', render: l => (
            <div className="flex justify-center gap-1">
                {l.consents ? (
                    <>
                        <div title="Transacional (Atualizações): Permitido" className={`p-1 rounded ${l.consents.transactional ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                            {l.consents.transactional ? <ShieldCheck size={14}/> : <ShieldAlert size={14}/>}
                        </div>
                        <div title="Marketing (Ofertas): Permitido" className={`p-1 rounded ${l.consents.marketing ? 'text-blue-400 bg-blue-500/10' : 'text-slate-600 bg-slate-800'}`}>
                            {l.consents.marketing ? <MessageCircle size={14}/> : <MessageCircle size={14} className="opacity-30"/>}
                        </div>
                    </>
                ) : (
                    <span className="text-[10px] text-slate-600">N/A</span>
                )}
            </div>
        )},
        { header: 'Tipo / Etapa', accessor: 'type', render: l => (
            <div>
                <div className={`text-xs px-2 py-0.5 rounded font-bold w-fit ${l.type === 'CHECKOUT_ABANDONED' ? 'bg-orange-500/10 text-orange-400' : 'bg-slate-700 text-slate-400'}`}>
                    {l.type === 'CHECKOUT_ABANDONED' ? 'Checkout' : 'Carrinho'}
                </div>
                <div className="text-xs text-slate-400 capitalize mt-1">{l.funnelStep.replace('_', ' ')}</div>
            </div>
        )},
        { header: 'Itens', accessor: 'itemsSummary', render: l => (
            <div className="text-xs text-slate-400 truncate max-w-xs">
                {l.itemsSummary.map(i => `${i.quantity}x ${i.name}`).join(', ')}
            </div>
        )},
        { header: 'Valor', accessor: 'value', sortable: true, headerClassName: 'text-right', cellClassName: 'text-right text-red-400 font-medium', render: l => `R$ ${l.value.toFixed(2)}` },
        { header: 'Abandonado há', accessor: 'abandonedAt', sortable: true, render: l => <span className="text-xs text-slate-500">{timeSince(l.abandonedAt)}</span> },
        { header: 'Status Recuperação', accessor: 'recoveryStatus', render: l => (
            <select
                value={l.recoveryStatus}
                onChange={(e) => handleUpdateStatus(l.id, e.target.value as RecoveryStatus)}
                onClick={(e) => e.stopPropagation()}
                className="bg-black/40 border border-white/10 text-xs p-1 rounded text-slate-300"
            >
                <option value="pendente">Pendente</option>
                <option value="em_contato">Em Contato</option>
                <option value="recuperado">Recuperado</option>
                <option value="nao_recuperado">Não Recuperado</option>
            </select>
        )},
        { header: 'Ações', accessor: 'actions', cellClassName: 'relative', render: l => (
            <div className="flex gap-2">
                <button 
                    onClick={() => setPopoverLogId(popoverLogId === l.id ? null : l.id)}
                    disabled={!l.contact}
                    className={`p-2 rounded text-xs flex items-center gap-1.5 ${l.contact ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                    title={l.contact ? 'Enviar mensagem de recuperação' : 'Contato não disponível'}
                >
                    <MessageCircle size={14}/> <ChevronDown size={14} />
                </button>

                {popoverLogId === l.id && (
                    <div className="absolute right-0 top-full mt-1 w-64 bg-rs-card border border-rs-goldDim/50 rounded-lg shadow-2xl z-10 p-2 space-y-1">
                        <h4 className="text-xs font-bold text-slate-400 px-2 flex justify-between items-center">
                            Escolha o modelo:
                            {!l.consents?.marketing && <span className="text-[9px] text-yellow-500 border border-yellow-500/30 px-1 rounded">Sem Opt-in Mkt</span>}
                        </h4>
                        {getAvailableTemplates(l).map(template => (
                            <button
                                key={template.id}
                                onClick={() => handleSendWhatsApp(l, template.content)}
                                className="w-full text-left text-sm text-slate-200 hover:bg-white/5 p-2 rounded flex items-center gap-2"
                            >
                                <Send size={14} className="text-rs-gold"/> {template.name}
                            </button>
                        ))}
                        {getAvailableTemplates(l).length === 0 && (
                            <div className="text-xs text-slate-500 p-2 italic text-center">
                                Nenhum template disponível para este perfil de consentimento.
                            </div>
                        )}
                    </div>
                )}
                
                <button onClick={() => handleOpenNotesModal(l)} className="p-2 rounded text-xs flex items-center gap-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600">
                    <Edit size={14}/>
                </button>
            </div>
        )},
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex justify-between items-center bg-rs-card p-4 rounded-xl border border-rs-goldDim/20">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400"><AlertOctagon size={24} /></div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Recuperação de Vendas</h2>
                        <p className="text-sm text-slate-500">Gerencie e recupere carrinhos e checkouts abandonados.</p>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 bg-rs-card p-4 rounded-xl border border-rs-goldDim/20">
                <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold">
                    <Filter size={16}/> Filtros:
                </div>
                <div className="flex gap-4">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-black/40 border border-white/10 rounded-lg text-sm p-2 text-slate-300 outline-none">
                        <option value="all">Status: Todos</option>
                        <option value="pendente">Pendente</option>
                        <option value="em_contato">Em Contato</option>
                        <option value="recuperado">Recuperado</option>
                        <option value="nao_recuperado">Não Recuperado</option>
                    </select>
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-black/40 border border-white/10 rounded-lg text-sm p-2 text-slate-300 outline-none">
                        <option value="all">Tipo: Todos</option>
                        <option value="CART_ABANDONED">Carrinho</option>
                        <option value="CHECKOUT_ABANDONED">Checkout</option>
                    </select>
                    <select value={valueFilter} onChange={e => setValueFilter(e.target.value)} className="bg-black/40 border border-white/10 rounded-lg text-sm p-2 text-slate-300 outline-none">
                        <option value="all">Valor: Todos</option>
                        <option value="0-50">Até R$50</option>
                        <option value="50-150">R$50 a R$150</option>
                        <option value="150">Acima de R$150</option>
                    </select>
                </div>
            </div>

            <DataTable {...table} columns={columns} data={table.paginatedData} onSort={table.requestSort} onSearch={table.setSearchTerm} onPageChange={{next: table.nextPage, prev: table.prevPage, goTo: table.goToPage}} onItemsPerPageChange={table.handleItemsPerPageChange} searchPlaceholder="Buscar por cliente, contato, UTM..."/>

            {editingLog && (
                <ModalWrapper isOpen={!!editingLog} onClose={() => setEditingLog(null)} title={`Notas para ${editingLog.customerName || 'Visitante'}`}>
                    <div className="p-6 space-y-4">
                        <textarea
                            rows={5}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-slate-200 resize-none focus:border-rs-gold outline-none"
                            placeholder="Ex: Cliente pediu desconto. Enviar cupom amanhã."
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setEditingLog(null)} className="btn-secondary">Cancelar</button>
                            <button onClick={handleSaveNotes} className="btn-primary flex items-center gap-2"><Save size={16}/> Salvar Nota</button>
                        </div>
                    </div>
                     <style>{`.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem;}.btn-secondary{border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem;}`}</style>
                </ModalWrapper>
            )}
        </div>
    );
};