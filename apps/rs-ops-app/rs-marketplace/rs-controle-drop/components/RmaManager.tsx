import React, { useState, useMemo } from 'react';
import { RMA, User, Order, Customer, RMAType, RMAStatus, RMAReason } from '../types';
import { Plus, Edit2, Trash2, RefreshCw, Filter } from 'lucide-react';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';
import { ModalWrapper } from './ModalWrapper';

interface RmaManagerProps {
    rmas: RMA[];
    orders: Order[];
    customers: Customer[];
    onAdd: (rma: Omit<RMA, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
    onUpdate: (rma: RMA) => void;
    onDelete: (id: string) => void;
    currentUser: User;
    users: User[];
}

const EMPTY_RMA: Omit<RMA, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'customerName'> = {
    orderId: '',
    customerId: '',
    type: 'Troca',
    status: 'Solicitado',
    reason: 'Outro',
    items: [],
};

export const RmaManager: React.FC<RmaManagerProps> = ({ rmas, orders, customers, onAdd, onUpdate, onDelete, currentUser, users }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Omit<RMA, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'customerName'>>(EMPTY_RMA);

    const table = useDataTable({ initialData: rmas, searchKeys: ['customerName', 'orderId'] });

    const getStatusBadge = (status: RMAStatus) => {
        const styles: Record<RMAStatus, string> = {
            'Solicitado': 'bg-blue-500/10 text-blue-400',
            'Em Análise': 'bg-yellow-500/10 text-yellow-400',
            'Aprovado': 'bg-emerald-500/10 text-emerald-400',
            'Recusado': 'bg-red-500/10 text-red-400',
            'Concluído': 'bg-slate-700 text-slate-400',
        };
        return <span className={`px-2 py-1 rounded text-xs font-bold ${styles[status]}`}>{status}</span>;
    };

    const columns: Column<RMA>[] = [
        { header: 'Cliente/Pedido', accessor: 'customerName', sortable: true, render: r => (
            <div>
                <div className="font-bold text-slate-200">{r.customerName}</div>
                <div className="text-xs text-slate-500 font-mono">Pedido: #{r.orderId.slice(0, 8)}</div>
            </div>
        )},
        { header: 'Tipo', accessor: 'type', sortable: true, render: r => r.type },
        { header: 'Motivo', accessor: 'reason', render: r => <span className="text-sm text-slate-400">{r.reason}</span> },
        { header: 'Status', accessor: 'status', sortable: true, render: r => getStatusBadge(r.status) },
        { header: 'Criado em', accessor: 'createdAt', sortable: true, render: r => new Date(r.createdAt).toLocaleDateString('pt-BR') },
        { header: 'Ações', accessor: 'actions', render: r => (
            <div className="flex gap-2">
                <button onClick={() => handleOpenModal(r)} className="p-2 text-slate-400 hover:text-blue-400"><Edit2 size={16}/></button>
                <button onClick={() => onDelete(r.id)} className="p-2 text-slate-400 hover:text-red-400"><Trash2 size={16}/></button>
            </div>
        )}
    ];

    const handleOpenModal = (rma?: RMA) => {
        if (rma) {
            setEditingId(rma.id);
            setFormData(rma);
        } else {
            setEditingId(null);
            setFormData(EMPTY_RMA);
        }
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const customer = customers.find(c => c.id === formData.customerId);
        if (!customer) {
            alert("Cliente não encontrado!");
            return;
        }

        const dataToSave = { ...formData, customerName: customer.name };

        if (editingId) {
            onUpdate({ ...dataToSave, id: editingId, userId: (formData as RMA).userId, createdAt: (formData as RMA).createdAt, updatedAt: new Date().toISOString() });
        } else {
            onAdd(dataToSave);
        }
        setIsModalOpen(false);
    };
    
    const orderForRMA = useMemo(() => orders.find(o => o.id === formData.orderId), [orders, formData.orderId]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-rs-gold flex items-center gap-2"><RefreshCw /> Trocas & Devoluções (RMA)</h2>
                    <p className="text-sm text-slate-400">Gerencie solicitações de pós-venda.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2"><Plus size={18} /> Nova Solicitação</button>
            </div>
            
            <DataTable {...table} columns={columns} data={table.paginatedData} onSort={table.requestSort} onSearch={table.setSearchTerm} onPageChange={{next: table.nextPage, prev: table.prevPage, goTo: table.goToPage}} onItemsPerPageChange={table.handleItemsPerPageChange} />

            <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Solicitação de RMA' : 'Nova Solicitação de RMA'}>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-text">Pedido</label>
                            <select 
                                required 
                                value={formData.orderId}
                                onChange={e => {
                                    const order = orders.find(o => o.id === e.target.value);
                                    setFormData({ ...formData, orderId: e.target.value, customerId: order?.customerId || '' });
                                }} 
                                className="input-field"
                            >
                                <option value="">Selecione um pedido</option>
                                {orders.map(o => <option key={o.id} value={o.id}>#{o.id.slice(0,8)} - {o.customerName}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label-text">Cliente</label>
                            <input type="text" readOnly value={customers.find(c => c.id === formData.customerId)?.name || ''} className="input-field bg-black/20"/>
                        </div>
                    </div>
                    <div>
                        <label className="label-text">Itens</label>
                        <div className="bg-black/20 p-2 rounded-lg border border-white/5 space-y-1">
                            {orderForRMA?.items.map(item => (
                                <label key={item.id} className="flex items-center gap-2 p-1 rounded hover:bg-white/5 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="accent-rs-gold"
                                        checked={formData.items.some(i => i.productId === item.productId)}
                                        onChange={e => {
                                            const newItems = e.target.checked
                                                ? [...formData.items, { productId: item.productId, productName: item.productName, quantity: item.quantity }]
                                                : formData.items.filter(i => i.productId !== item.productId);
                                            setFormData({...formData, items: newItems });
                                        }}
                                    />
                                    <span className="text-sm">{item.quantity}x {item.productName}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="label-text">Tipo</label>
                            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as RMAType})} className="input-field">
                                <option>Troca</option>
                                <option>Devolução</option>
                                <option>Reembolso Parcial</option>
                            </select>
                        </div>
                        <div>
                            <label className="label-text">Status</label>
                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as RMAStatus})} className="input-field">
                                <option>Solicitado</option>
                                <option>Em Análise</option>
                                <option>Aprovado</option>
                                <option>Recusado</option>
                                <option>Concluído</option>
                            </select>
                        </div>
                        <div>
                            <label className="label-text">Motivo</label>
                            <select value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value as RMAReason})} className="input-field">
                                <option>Produto Danificado</option>
                                <option>Arrependimento</option>
                                <option>Erro de Envio</option>
                                <option>Tamanho Errado</option>
                                <option>Outro</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="label-text">Notas Internas</label>
                        <textarea rows={3} value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} className="input-field"/>
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