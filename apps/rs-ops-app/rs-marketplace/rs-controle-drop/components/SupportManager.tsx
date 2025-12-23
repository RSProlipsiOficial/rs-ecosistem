import React, { useState, useMemo } from 'react';
import { Ticket, User, Order, Customer, TicketStatus, TicketPriority } from '../types';
import { Plus, Edit2, Trash2, Headphones, Filter, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';
import { ModalWrapper } from './ModalWrapper';

interface SupportManagerProps {
    tickets: Ticket[];
    orders: Order[];
    customers: Customer[];
    onAdd: (ticket: Omit<Ticket, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
    onUpdate: (ticket: Ticket) => void;
    onDelete: (id: string) => void;
    currentUser: User;
    users: User[];
}

const EMPTY_TICKET: Omit<Ticket, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
    customerId: '',
    customerName: '',
    channel: 'WhatsApp',
    subject: '',
    description: '',
    status: 'Novo',
    priority: 'Média',
};

export const SupportManager: React.FC<SupportManagerProps> = ({ tickets, orders, customers, onAdd, onUpdate, onDelete, currentUser, users }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Omit<Ticket, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>(EMPTY_TICKET);

    const table = useDataTable({ initialData: tickets, searchKeys: ['customerName', 'subject', 'orderId'] });

    const getStatusBadge = (status: TicketStatus) => {
        const styles: Record<TicketStatus, string> = {
            'Novo': 'bg-blue-500/10 text-blue-400',
            'Em Andamento': 'bg-yellow-500/10 text-yellow-400',
            'Resolvido': 'bg-emerald-500/10 text-emerald-400',
            'Arquivado': 'bg-slate-700 text-slate-400'
        };
        return <span className={`px-2 py-1 rounded text-xs font-bold ${styles[status]}`}>{status}</span>;
    };

    const getPriorityBadge = (priority: TicketPriority) => {
        const styles: Record<TicketPriority, string> = {
            'Baixa': 'text-slate-400',
            'Média': 'text-yellow-400',
            'Alta': 'text-orange-400',
            'Crítica': 'text-red-400 font-bold'
        };
        return <span className={`font-medium ${styles[priority]}`}>{priority}</span>;
    };

    const columns: Column<Ticket>[] = [
        { header: 'Cliente/Pedido', accessor: 'customerName', sortable: true, render: t => (
            <div>
                <div className="font-bold text-slate-200">{t.customerName}</div>
                <div className="text-xs text-slate-500 font-mono">Pedido: #{t.orderId?.slice(0, 8) || 'N/A'}</div>
            </div>
        )},
        { header: 'Assunto', accessor: 'subject', render: t => (
            <div className="text-sm text-slate-300 max-w-xs truncate" title={t.subject}>{t.subject}</div>
        )},
        { header: 'Status', accessor: 'status', sortable: true, render: t => getStatusBadge(t.status) },
        { header: 'Prioridade', accessor: 'priority', sortable: true, render: t => getPriorityBadge(t.priority) },
        { header: 'Criado em', accessor: 'createdAt', sortable: true, render: t => <span className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString('pt-BR')}</span> },
        { header: 'Ações', accessor: 'actions', render: t => (
            <div className="flex gap-2">
                <button onClick={() => handleOpenModal(t)} className="p-2 text-slate-400 hover:text-blue-400"><Edit2 size={16}/></button>
                <button onClick={() => onDelete(t.id)} className="p-2 text-slate-400 hover:text-red-400"><Trash2 size={16}/></button>
            </div>
        )}
    ];

    const handleOpenModal = (ticket?: Ticket) => {
        if (ticket) {
            setEditingId(ticket.id);
            setFormData(ticket);
        } else {
            setEditingId(null);
            setFormData(EMPTY_TICKET);
        }
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            onUpdate({ ...formData, id: editingId, userId: (formData as Ticket).userId });
        } else {
            onAdd({ ...formData });
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-rs-gold">Atendimento / Tickets</h2>
                    <p className="text-sm text-slate-400">Gerencie as solicitações de suporte dos seus clientes.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2"><Plus size={18} /> Novo Ticket</button>
            </div>
            
            <DataTable {...table} columns={columns} data={table.paginatedData} onSort={table.requestSort} onSearch={table.setSearchTerm} onPageChange={{next: table.nextPage, prev: table.prevPage, goTo: table.goToPage}} onItemsPerPageChange={table.handleItemsPerPageChange} />

            <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Ticket' : 'Novo Ticket de Atendimento'}>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-text">Cliente</label>
                            <select 
                                required 
                                value={formData.customerId}
                                onChange={e => {
                                    const customer = customers.find(c => c.id === e.target.value);
                                    setFormData({...formData, customerId: e.target.value, customerName: customer?.name || '' });
                                }} 
                                className="input-field"
                            >
                                <option value="">Selecione um cliente</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="label-text">Pedido Relacionado (Opcional)</label>
                             <select 
                                value={formData.orderId}
                                onChange={e => setFormData({...formData, orderId: e.target.value })} 
                                className="input-field"
                            >
                                <option value="">Nenhum</option>
                                {orders.filter(o => o.customerId === formData.customerId).map(o => <option key={o.id} value={o.id}>#{o.id.slice(0,8)} - {o.date.split('-').reverse().join('/')}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="label-text">Assunto</label>
                        <input type="text" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="input-field"/>
                    </div>
                     <div>
                        <label className="label-text">Descrição / Pergunta do Cliente</label>
                        <textarea rows={4} required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-field"/>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="label-text">Status</label>
                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as TicketStatus})} className="input-field">
                                <option>Novo</option>
                                <option>Em Andamento</option>
                                <option>Resolvido</option>
                                <option>Arquivado</option>
                            </select>
                        </div>
                        <div>
                            <label className="label-text">Prioridade</label>
                            <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as TicketPriority})} className="input-field">
                                <option>Baixa</option>
                                <option>Média</option>
                                <option>Alta</option>
                                <option>Crítica</option>
                            </select>
                        </div>
                         <div>
                            <label className="label-text">Canal de Origem</label>
                            <select value={formData.channel} onChange={e => setFormData({...formData, channel: e.target.value as any})} className="input-field">
                                <option>WhatsApp</option>
                                <option>Email</option>
                                <option>Instagram</option>
                                <option>Outros</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar</button>
                    </div>
                </form>
            </ModalWrapper>
            <style>{`.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem;}.btn-secondary{background-color:transparent;border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem;}.label-text{display:block;font-size:0.75rem;color:#94a3b8;margin-bottom:0.25rem}.input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e2e8f0;outline:none}`}</style>
        </div>
    );
};
