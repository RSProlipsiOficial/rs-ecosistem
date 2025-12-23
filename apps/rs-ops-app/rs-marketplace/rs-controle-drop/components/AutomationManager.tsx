import React, { useState } from 'react';
import { AutomationRule, MessageTemplate } from '../types';
import { Zap, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Info } from 'lucide-react';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';
import { ModalWrapper } from './ModalWrapper';

interface AutomationManagerProps {
    rules: AutomationRule[];
    templates: MessageTemplate[];
    onAdd: (rule: Omit<AutomationRule, 'id' | 'userId'>) => void;
    onUpdate: (rule: AutomationRule) => void;
    onDelete: (id: string) => void;
}

const EMPTY_RULE: Omit<AutomationRule, 'id' | 'userId'> = {
    name: '',
    triggerEvent: 'ORDER_CREATED',
    delayDays: 0,
    action: 'SEND_WHATSAPP',
    isActive: true,
};

export const AutomationManager: React.FC<AutomationManagerProps> = ({ rules, templates, onAdd, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Omit<AutomationRule, 'id' | 'userId'>>(EMPTY_RULE);

    const table = useDataTable({ initialData: rules, searchKeys: ['name'] });

    const handleToggleActive = (rule: AutomationRule) => {
        onUpdate({ ...rule, isActive: !rule.isActive });
    };

    const columns: Column<AutomationRule>[] = [
        { 
            header: 'Nome da Automação', 
            accessor: 'name', 
            sortable: true,
            render: r => <span className="font-bold text-slate-200">{r.name}</span>
        },
        { 
            header: 'Gatilho (Quando)', 
            accessor: 'triggerEvent', 
            render: r => (
                <div className="text-xs">
                    <div className="font-medium text-slate-300">{formatTrigger(r.triggerEvent)}</div>
                    {r.triggerEvent === 'DAYS_AFTER_DELIVERY' && <div className="text-slate-500">após {r.delayDays} dia(s)</div>}
                </div>
            )
        },
        { 
            header: 'Ação (O que fazer)', 
            accessor: 'action', 
            render: r => (
                 <div className="text-xs">
                    <div className="font-medium text-slate-300">{formatAction(r.action)}</div>
                    {r.templateId && <div className="text-slate-500">Usando template: "{templates.find(t => t.id === r.templateId)?.name}"</div>}
                </div>
            )
        },
        { 
            header: 'Status', 
            accessor: 'isActive', 
            headerClassName: 'text-center', 
            cellClassName: 'text-center',
            render: r => (
                <button onClick={() => handleToggleActive(r)} className={`p-1 rounded-full ${r.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {r.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
            )
        },
        { 
            header: 'Ações', 
            accessor: 'actions', 
            headerClassName: 'text-center', 
            cellClassName: 'text-center',
            render: r => (
                <div className="flex justify-center gap-2">
                    <button onClick={() => handleOpenModal(r)} className="p-2 text-slate-400 hover:text-blue-400"><Edit2 size={16}/></button>
                    <button onClick={() => onDelete(r.id)} className="p-2 text-slate-400 hover:text-red-400"><Trash2 size={16}/></button>
                </div>
            )
        }
    ];
    
    const formatTrigger = (trigger: string) => {
        const map: Record<string, string> = {
            'ORDER_CREATED': 'Pedido Criado',
            'ORDER_SHIPPED': 'Pedido Enviado',
            'ORDER_DELIVERED': 'Pedido Entregue',
            'DAYS_AFTER_DELIVERY': 'Dias Após Entrega'
        };
        return map[trigger] || trigger;
    };

    const formatAction = (action: string) => {
        const map: Record<string, string> = {
            'SEND_WHATSAPP': 'Enviar WhatsApp',
            'SEND_EMAIL': 'Enviar E-mail',
            'CREATE_TASK': 'Criar Tarefa',
            'CREATE_TICKET': 'Abrir Ticket de Suporte'
        };
        return map[action] || action;
    }

    const handleOpenModal = (rule?: AutomationRule) => {
        if (rule) {
            setEditingId(rule.id);
            setFormData(rule);
        } else {
            setEditingId(null);
            setFormData(EMPTY_RULE);
        }
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            onUpdate({ ...formData, id: editingId, userId: (formData as AutomationRule).userId });
        } else {
            onAdd(formData);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-rs-gold flex items-center gap-2"><Zap /> Automações de Pós-Venda</h2>
                    <p className="text-sm text-slate-400">Crie regras para se comunicar com seus clientes automaticamente.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2"><Plus size={18} /> Nova Regra</button>
            </div>

            <DataTable {...table} columns={columns} data={table.paginatedData} onSort={table.requestSort} onSearch={table.setSearchTerm} onPageChange={{next: table.nextPage, prev: table.prevPage, goTo: table.goToPage}} onItemsPerPageChange={table.handleItemsPerPageChange} />

            <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Regra de Automação' : 'Nova Regra de Automação'}>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div>
                        <label className="label-text">Nome da Automação</label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" placeholder="Ex: Enviar código de rastreio"/>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div>
                            <label className="label-text">Gatilho (Quando...)</label>
                            <select value={formData.triggerEvent} onChange={e => setFormData({...formData, triggerEvent: e.target.value as any, delayDays: 0})} className="input-field">
                                <option value="ORDER_CREATED">um pedido for criado</option>
                                <option value="ORDER_SHIPPED">um pedido for enviado</option>
                                <option value="ORDER_DELIVERED">um pedido for entregue</option>
                                <option value="DAYS_AFTER_DELIVERY">X dias após a entrega</option>
                            </select>
                        </div>
                        {formData.triggerEvent === 'DAYS_AFTER_DELIVERY' && (
                            <div>
                                <label className="label-text">Aguardar (dias)</label>
                                <input type="number" min="0" value={formData.delayDays} onChange={e => setFormData({...formData, delayDays: parseInt(e.target.value) || 0})} className="input-field" />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label-text">Ação (Então...)</label>
                            <select value={formData.action} onChange={e => setFormData({...formData, action: e.target.value as any})} className="input-field">
                                <option value="SEND_WHATSAPP">enviar uma mensagem de WhatsApp</option>
                                <option value="SEND_EMAIL">enviar um e-mail</option>
                                <option value="CREATE_TICKET">abrir um ticket de suporte</option>
                                <option value="CREATE_TASK">criar uma tarefa interna</option>
                            </select>
                        </div>
                        {(formData.action === 'SEND_WHATSAPP' || formData.action === 'SEND_EMAIL') && (
                            <div>
                                <label className="label-text">Usar o template</label>
                                <select value={formData.templateId} onChange={e => setFormData({...formData, templateId: e.target.value})} className="input-field">
                                    <option value="">Nenhum (usará texto padrão)</option>
                                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-blue-900/10 border border-blue-500/20 p-3 rounded-lg flex items-start gap-2 text-xs text-blue-300">
                        <Info size={16} className="shrink-0 mt-0.5"/>
                        <p>O motor de automação verificará os pedidos periodicamente. A ação será disparada uma única vez por pedido quando a condição for atendida.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar Regra</button>
                    </div>
                </form>
            </ModalWrapper>
             <style>{`.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem;}.btn-secondary{background-color:transparent;border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem;}.label-text{display:block;font-size:0.75rem;color:#94a3b8;margin-bottom:0.25rem}.input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e2e8f0;outline:none}`}</style>
        </div>
    );
};
