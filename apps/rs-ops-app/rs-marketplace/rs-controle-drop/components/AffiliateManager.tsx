import React, { useState, useMemo } from 'react';
import { Affiliate, User, Order } from '../types';
import { Tag, Plus, Edit2, Trash2, X, BarChart2 } from 'lucide-react';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';
import { ModalWrapper } from './ModalWrapper';

interface AffiliateManagerProps {
    affiliates: Affiliate[];
    orders: Order[];
    onUpdateAffiliates: (affiliates: Affiliate[]) => void;
    onUpdateOrders: (orders: Order[]) => void;
    currentUser: User;
}

const EMPTY_AFFILIATE: Omit<Affiliate, 'id' | 'userId'> = { name: '', email: '', pixKey: '', isActive: true };

export const AffiliateManager: React.FC<AffiliateManagerProps> = ({ affiliates, orders, onUpdateAffiliates, onUpdateOrders, currentUser }) => {
    const [activeTab, setActiveTab] = useState<'affiliates' | 'commissions'>('affiliates');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);

    // Affiliates Management
    const affiliateTable = useDataTable({ initialData: affiliates, searchKeys: ['name', 'email'] });

    const handleOpenModal = (affiliate?: Affiliate) => {
        setEditingAffiliate(affiliate || null);
        setIsModalOpen(true);
    };

    const handleSaveAffiliate = (formData: Omit<Affiliate, 'id' | 'userId'>) => {
        if (editingAffiliate) {
            onUpdateAffiliates(affiliates.map(a => a.id === editingAffiliate.id ? { ...a, ...formData } : a));
        } else {
            onUpdateAffiliates([...affiliates, { ...formData, id: crypto.randomUUID(), userId: currentUser.id }]);
        }
        setIsModalOpen(false);
    };

    const handleDeleteAffiliate = (id: string) => {
        if (confirm('Tem certeza que deseja remover este afiliado?')) {
            onUpdateAffiliates(affiliates.filter(a => a.id !== id));
        }
    };

    // Commissions Management
    const commissionableOrders = useMemo(() => orders.filter(o => o.affiliateId), [orders]);
    const commissionTable = useDataTable({ initialData: commissionableOrders, searchKeys: ['customerName', 'id'] });

    const handleMarkAsPaid = (orderIds: string[]) => {
        if (confirm(`Marcar ${orderIds.length} comissão(ões) como pagas?`)) {
            onUpdateOrders(orders.map(o => orderIds.includes(o.id) ? { ...o, commissionPaid: true } : o));
        }
    };

    const affiliateColumns: Column<Affiliate>[] = [
        { header: 'Nome', accessor: 'name', sortable: true, render: a => <span className="font-bold">{a.name}</span> },
        { header: 'Email', accessor: 'email' },
        { header: 'Chave PIX', accessor: 'pixKey' },
        { header: 'Status', accessor: 'isActive', render: a => a.isActive ? <span className="text-emerald-400">Ativo</span> : <span className="text-slate-500">Inativo</span> },
        {
            header: 'Ações', accessor: 'actions', render: a => (
                <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(a)} className="p-2 hover:text-blue-400"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteAffiliate(a.id)} className="p-2 hover:text-red-400"><Trash2 size={16} /></button>
                </div>
            )
        }
    ];

    const commissionColumns: Column<Order>[] = [
        { header: 'Pedido', accessor: 'id', render: o => <span className="font-mono text-xs text-rs-gold">#{o.id.slice(0, 8)}</span> },
        { header: 'Data', accessor: 'date' },
        { header: 'Afiliado', accessor: 'affiliateId', render: o => affiliates.find(a => a.id === o.affiliateId)?.name || 'N/A' },
        { header: 'Comissão', accessor: 'affiliateCommission', headerClassName: 'text-right', cellClassName: 'text-right font-medium text-emerald-400', render: o => `R$ ${(o.affiliateCommission || 0).toFixed(2)}` },
        {
            header: 'Status Pagto', accessor: 'commissionPaid', render: o => (
                o.commissionPaid 
                ? <span className="px-2 py-1 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400">Pago</span> 
                : <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500/10 text-yellow-400">Pendente</span>
            )
        },
        {
            header: 'Ação', accessor: 'actions', render: o => (
                !o.commissionPaid ? <button onClick={() => handleMarkAsPaid([o.id])} className="btn-secondary-sm">Marcar como Pago</button> : null
            )
        }
    ];


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-rs-gold flex items-center gap-2"><Tag /> Gerenciador de Afiliados</h2>
                </div>
                {activeTab === 'affiliates' && <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2"><Plus /> Novo Afiliado</button>}
            </div>

            <div className="flex gap-1 p-1 bg-rs-dark rounded-xl border border-white/10 w-fit">
                <button onClick={() => setActiveTab('affiliates')} className={`tab-btn ${activeTab === 'affiliates' && 'active'}`}>Afiliados</button>
                <button onClick={() => setActiveTab('commissions')} className={`tab-btn ${activeTab === 'commissions' && 'active'}`}>Relatório de Comissões</button>
            </div>

            {activeTab === 'affiliates' && (
                <DataTable {...affiliateTable} columns={affiliateColumns} data={affiliateTable.paginatedData} onSort={affiliateTable.requestSort} onSearch={affiliateTable.setSearchTerm} onPageChange={{ next: affiliateTable.nextPage, prev: affiliateTable.prevPage, goTo: affiliateTable.goToPage }} onItemsPerPageChange={affiliateTable.handleItemsPerPageChange} />
            )}

            {activeTab === 'commissions' && (
                 <DataTable {...commissionTable} columns={commissionColumns} data={commissionTable.paginatedData} onSort={commissionTable.requestSort} onSearch={commissionTable.setSearchTerm} onPageChange={{ next: commissionTable.nextPage, prev: commissionTable.prevPage, goTo: commissionTable.goToPage }} onItemsPerPageChange={commissionTable.handleItemsPerPageChange} />
            )}

            {isModalOpen && <AffiliateModal affiliate={editingAffiliate} onClose={() => setIsModalOpen(false)} onSave={handleSaveAffiliate} />}
            <style>{`.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem;}.btn-secondary-sm{font-size:0.8rem;border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.3rem 0.8rem;border-radius:0.5rem;}.tab-btn{padding:0.5rem 1rem;border-radius:0.5rem;font-weight:bold;font-size:0.875rem;}.tab-btn.active{background-color:#d4af37;color:#0a0a0a;}`}</style>
        </div>
    );
};

// --- MODAL ---
interface AffiliateModalProps {
    affiliate: Affiliate | null;
    onClose: () => void;
    onSave: (data: Omit<Affiliate, 'id' | 'userId'>) => void;
}
const AffiliateModal: React.FC<AffiliateModalProps> = ({ affiliate, onClose, onSave }) => {
    const [formData, setFormData] = useState(affiliate ? { name: affiliate.name, email: affiliate.email, pixKey: affiliate.pixKey, isActive: affiliate.isActive } : EMPTY_AFFILIATE);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <ModalWrapper isOpen={true} onClose={onClose} title={affiliate ? 'Editar Afiliado' : 'Novo Afiliado'}>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div><label className="label-text">Nome</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-field" required /></div>
                <div><label className="label-text">Email</label><input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="input-field" required /></div>
                <div><label className="label-text">Chave PIX</label><input type="text" value={formData.pixKey} onChange={e => setFormData({ ...formData, pixKey: e.target.value })} className="input-field" required /></div>
                <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={onClose} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">Salvar</button></div>
            </form>
             <style>{`.label-text{display:block;font-size:0.75rem;color:#94a3b8;margin-bottom:0.25rem}.input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e2e8f0;outline:none}.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem}.btn-secondary{border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem;}`}</style>
        </ModalWrapper>
    );
}