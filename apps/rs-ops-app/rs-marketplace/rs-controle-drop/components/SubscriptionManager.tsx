import React, { useState } from 'react';
import { Subscription, Customer, Product, SubscriptionStatus } from '../types';
import { Repeat, Plus, Edit2, Trash2, Play, Pause, XCircle, RefreshCw, CheckCircle, CreditCard, Loader2 } from 'lucide-react';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';
import { ModalWrapper } from './ModalWrapper';
import { paymentGatewayService } from '../services/paymentGatewayService';
import { useNotifier } from '../contexts/NotificationContext';

interface SubscriptionManagerProps {
  subscriptions: Subscription[];
  customers: Customer[];
  products: Product[];
  onAdd: (sub: Omit<Subscription, 'id' | 'userId'>) => void;
  onUpdate: (sub: Subscription) => void;
  onDelete: (id: string) => void;
}

const EMPTY_SUBSCRIPTION: Omit<Subscription, 'id'|'userId'|'customerName'|'productName'> = {
    customerId: '',
    productId: '',
    status: 'active',
    interval: 'monthly',
    price: 0,
    startDate: new Date().toISOString().split('T')[0],
    nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
};

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ subscriptions, customers, products, onAdd, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>(EMPTY_SUBSCRIPTION);
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useNotifier();

    const table = useDataTable({ initialData: subscriptions, searchKeys: ['customerName', 'productName'] });
    
    const handleOpenModal = (sub?: Subscription) => {
        if (sub) {
            setEditingId(sub.id);
            setFormData(sub);
        } else {
            setEditingId(null);
            setFormData(EMPTY_SUBSCRIPTION);
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const customer = customers.find(c => c.id === formData.customerId);
        const product = products.find(p => p.id === formData.productId);
        
        if(!customer || !product) {
            addToast("Dados inválidos.", 'error');
            return;
        }

        setIsLoading(true);
        try {
            let gatewayData = { id: formData.gatewayId, status: formData.gatewayStatus };

            // PRT-309: Criar no Gateway se for novo
            if (!editingId) {
                const response = await paymentGatewayService.createSubscription(
                    customer,
                    product,
                    formData.interval,
                    formData.price
                );
                gatewayData = { id: response.id, status: response.status };
                addToast("Assinatura criada no Gateway!", 'success');
            }

            const dataToSave = {
                ...formData,
                customerName: customer.name,
                productName: product.name,
                gatewayId: gatewayData.id,
                gatewayStatus: gatewayData.status,
                status: gatewayData.status === 'active' ? 'active' : 'past_due'
            };

            if (editingId) onUpdate(dataToSave);
            else onAdd(dataToSave);
            
            setIsModalOpen(false);
        } catch (error: any) {
            addToast(`Erro no Gateway: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const columns: Column<Subscription>[] = [
        { header: 'Cliente', accessor: 'customerName', sortable: true, render: s => <span className="font-bold text-slate-200">{s.customerName}</span>},
        { header: 'Plano', accessor: 'productName' },
        { header: 'Status', accessor: 'status', render: s => <span className={`px-2 py-1 rounded text-xs font-bold ${s.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{s.status.toUpperCase()}</span>},
        { header: 'Valor', accessor: 'price', render: s => `R$ ${s.price.toFixed(2)}`},
        { header: 'Ações', accessor: 'actions', render: s => (
            <div className="flex gap-2">
                <button onClick={() => handleOpenModal(s)} className="p-2 text-slate-400 hover:text-blue-400"><Edit2 size={16}/></button>
            </div>
        )}
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-rs-gold flex items-center gap-2"><CreditCard /> Assinaturas (Gateway Real)</h2>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2"><Plus size={18} /> Nova Assinatura</button>
            </div>
            <DataTable {...table} columns={columns} data={table.paginatedData} onSort={table.requestSort} onSearch={table.setSearchTerm} onPageChange={{next: table.nextPage, prev: table.prevPage, goTo: table.goToPage}} onItemsPerPageChange={table.handleItemsPerPageChange} />
            
            <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Assinatura' : 'Nova Assinatura'}>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                     {/* Campos do formulário omitidos para brevidade, mas lógica de salvar implementada acima */}
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-text">Cliente</label>
                            <select required value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} className="input-field" disabled={!!editingId}>
                                <option value="">Selecione...</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label-text">Plano / Produto</label>
                            <select required value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})} className="input-field" disabled={!!editingId}>
                                <option value="">Selecione...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                     </div>
                     <div><label className="label-text">Valor (R$)</label><input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="input-field"/></div>
                     <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
                        <button type="submit" disabled={isLoading} className="btn-primary flex items-center gap-2">{isLoading ? <Loader2 className="animate-spin"/> : <CheckCircle/>} Salvar</button>
                     </div>
                </form>
            </ModalWrapper>
            <style>{`.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem;}.btn-secondary{border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem;}.label-text{display:block;font-size:0.75rem;color:#94a3b8;margin-bottom:0.25rem}.input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e2e8f0;outline:none}`}</style>
        </div>
    );
};