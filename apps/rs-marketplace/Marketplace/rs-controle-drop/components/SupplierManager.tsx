

import React, { useState, useMemo } from 'react';
import { Supplier, User, Order } from '../types';
import { Plus, Edit2, Trash2, X, Building, Phone, Mail, BarChart2, Clock, DollarSign, TrendingUp, AlertTriangle, Package } from 'lucide-react';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';
import { ModalWrapper } from './ModalWrapper';

interface SupplierManagerProps {
  suppliers: Supplier[];
  orders: Order[]; // Passed from App for metrics calculation
  onAdd: (s: Omit<Supplier, 'id'>) => void;
  onUpdate: (s: Supplier) => void;
  onDelete: (id: string) => void;
  currentUser: User;
  users: User[];
}

const EMPTY_SUPPLIER: Omit<Supplier, 'id'> = {
  name: '', contactPerson: '', phone: '', email: '', userId: ''
};

export const SupplierManager: React.FC<SupplierManagerProps> = ({ suppliers, orders, onAdd, onUpdate, onDelete, currentUser, users }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Supplier, 'id'>>(EMPTY_SUPPLIER);
  const [viewingSupplierId, setViewingSupplierId] = useState<string | null>(null);

  const table = useDataTable({ initialData: suppliers, searchKeys: ['name', 'contactPerson', 'email'] });

  const columns: Column<Supplier>[] = [
    { 
      header: 'Fornecedor', accessor: 'name', sortable: true, 
      render: (s) => (
        <div>
          <span className="font-bold text-slate-200">{s.name}</span>
          <div className="text-xs text-slate-500">{s.contactPerson || 'Sem contato principal'}</div>
        </div>
      )
    },
    ...(currentUser.role === 'Admin' ? [{
        header: 'Logista', accessor: 'userId', sortable: true,
        render: (s: Supplier) => <span className="text-xs text-slate-400">{users.find(u => u.id === s.userId)?.name || 'N/A'}</span>
    } as Column<Supplier>] : []),
    {
      header: 'Contato', accessor: 'phone', sortable: false,
      render: (s) => (
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1.5"><Phone size={12}/> {s.phone || 'N/A'}</div>
          <div className="flex items-center gap-1.5"><Mail size={12}/> {s.email || 'N/A'}</div>
        </div>
      )
    },
    {
      header: 'Ações', accessor: 'actions', headerClassName: 'text-center', cellClassName: 'text-center',
      render: (s) => (
        <div className="flex justify-center gap-2">
            <button onClick={() => setViewingSupplierId(s.id)} className="p-2 text-slate-400 hover:text-rs-gold" title="Ver Métricas"><BarChart2 size={16}/></button>
            <button onClick={() => handleOpenModal(s)} className="p-2 text-slate-400 hover:text-blue-400"><Edit2 size={16}/></button>
            <button onClick={() => onDelete(s.id)} className="p-2 text-slate-400 hover:text-red-400"><Trash2 size={16}/></button>
        </div>
      )
    }
  ];

  const handleOpenModal = (s?: Supplier) => {
    if (s) {
      setEditingId(s.id);
      setFormData(s);
    } else {
      setEditingId(null);
      setFormData(EMPTY_SUPPLIER);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate({ ...formData, id: editingId, userId: formData.userId || currentUser.id });
    } else {
      onAdd({ ...formData, userId: currentUser.id });
    }
    setIsModalOpen(false);
  };
  
  const viewingSupplier = suppliers.find(s => s.id === viewingSupplierId);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-rs-gold">Fornecedores</h2>
          <p className="text-sm text-slate-400">Gerencie seus parceiros de fornecimento.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2"><Plus size={18} /> Novo Fornecedor</button>
      </div>

      <DataTable {...table} columns={columns} data={table.paginatedData} onSort={table.requestSort} onSearch={table.setSearchTerm} onPageChange={{next: table.nextPage, prev: table.prevPage, goTo: table.goToPage}} onItemsPerPageChange={table.handleItemsPerPageChange} searchPlaceholder="Buscar por nome, contato..."/>
      
      {/* ADD/EDIT MODAL */}
      <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Fornecedor' : 'Novo Fornecedor'}>
        <form onSubmit={handleSave} className="p-6 space-y-4">
            <div><label className="label-text">Nome da Empresa</label><input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field"/></div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="label-text">Pessoa de Contato</label><input type="text" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} className="input-field"/></div>
                <div><label className="label-text">Telefone / WhatsApp</label><input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-field"/></div>
            </div>
            <div><label className="label-text">E-mail</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-field"/></div>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Salvar</button>
            </div>
        </form>
      </ModalWrapper>

      {/* METRICS MODAL */}
      {viewingSupplier && (
        <SupplierMetricsModal 
          supplier={viewingSupplier} 
          orders={orders} 
          onClose={() => setViewingSupplierId(null)} 
        />
      )}

      <style>{`.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem;}.btn-secondary{background-color:transparent;border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem;}.label-text{display:block;font-size:0.75rem;color:#94a3b8;margin-bottom:0.25rem}.input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e2e8f0;outline:none}`}</style>
    </div>
  );
};


const SupplierMetricsModal = ({ supplier, orders, onClose }: { supplier: Supplier, orders: Order[], onClose: () => void }) => {
  const metrics = useMemo(() => {
    let totalCostVolume = 0;
    let totalRevenueVolume = 0;
    let totalItemsSold = 0;
    let totalItemsReturned = 0;
    let shippingTimeSum = 0;
    let shippingTimeCount = 0;
    
    // Map to count products sold for this supplier
    const productSales = new Map<string, { name: string, quantity: number, revenue: number }>();

    orders.forEach(order => {
        const supplierItems = order.items.filter(i => i.supplierId === supplier.id);
        if (supplierItems.length === 0) return;

        // Financials & Volume
        supplierItems.forEach(item => {
            const qty = item.quantity;
            totalCostVolume += item.unitCost * qty;
            totalRevenueVolume += item.unitPrice * qty;
            totalItemsSold += qty;
            
            // Check for returns (Order level status is simplest proxy)
            if (['Returned', 'Refunded'].includes(order.status)) {
                totalItemsReturned += qty;
            }

            // Top Products Calc
            const current = productSales.get(item.productId) || { name: item.productName, quantity: 0, revenue: 0 };
            current.quantity += qty;
            current.revenue += item.unitPrice * qty;
            productSales.set(item.productId, current);
        });

        // Shipping Time Calculation
        // Only calculate if order has shipping dates and is not new/packing
        if (order.date && order.shippingDate) {
            const start = new Date(order.date).getTime();
            const end = new Date(order.shippingDate).getTime();
            const days = (end - start) / (1000 * 60 * 60 * 24);
            // Ignore valid negative dates (data entry error)
            if (days >= 0) {
                shippingTimeSum += days;
                shippingTimeCount++;
            }
        }
    });

    const avgMargin = totalRevenueVolume > 0 ? ((totalRevenueVolume - totalCostVolume) / totalRevenueVolume) * 100 : 0;
    const returnRate = totalItemsSold > 0 ? (totalItemsReturned / totalItemsSold) * 100 : 0;
    const avgShippingTime = shippingTimeCount > 0 ? shippingTimeSum / shippingTimeCount : 0;

    return { 
        totalCostVolume, 
        avgMargin, 
        returnRate, 
        avgShippingTime, 
        totalItemsSold,
        topProducts: Array.from(productSales.values()).sort((a,b) => b.quantity - a.quantity).slice(0, 5)
    };
  }, [supplier.id, orders]);

  const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  return (
    <ModalWrapper isOpen={true} onClose={onClose} title="Métricas do Fornecedor">
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="p-3 bg-rs-gold/10 rounded-full border border-rs-gold/30">
                    <Building size={24} className="text-rs-gold"/>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-100">{supplier.name}</h2>
                    <p className="text-sm text-slate-500">{supplier.contactPerson ? `${supplier.contactPerson} • ` : ''}{supplier.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard 
                    title="Volume de Compras" 
                    value={formatCurrency(metrics.totalCostVolume)} 
                    subtext={`${metrics.totalItemsSold} itens comprados`}
                    icon={<DollarSign size={20} className="text-blue-400"/>}
                />
                 <KPICard 
                    title="Margem Média" 
                    value={`${metrics.avgMargin.toFixed(1)}%`} 
                    subtext="Lucro bruto sobre produtos"
                    icon={<TrendingUp size={20} className="text-emerald-400"/>}
                />
                 <KPICard 
                    title="Tempo Médio Envio" 
                    value={metrics.avgShippingTime > 0 ? `${metrics.avgShippingTime.toFixed(1)} dias` : 'N/A'} 
                    subtext="Data Pedido -> Data Envio"
                    icon={<Clock size={20} className="text-rs-gold"/>}
                />
                 <KPICard 
                    title="Taxa de Devolução" 
                    value={`${metrics.returnRate.toFixed(1)}%`} 
                    subtext="Baseado em pedidos devolvidos"
                    icon={<AlertTriangle size={20} className={metrics.returnRate > 5 ? "text-red-400" : "text-slate-400"}/>}
                />
            </div>

            {/* Top Products Table */}
            <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/5 font-bold text-slate-300 flex items-center gap-2">
                    <Package size={18} className="text-rs-gold"/> Principais Produtos Fornecidos
                </div>
                {metrics.topProducts.length > 0 ? (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-slate-500 text-xs uppercase">
                            <tr>
                                <th className="p-3">Produto</th>
                                <th className="p-3 text-right">Qtd Vendida</th>
                                <th className="p-3 text-right">Receita Gerada</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {metrics.topProducts.map((p, idx) => (
                                <tr key={idx} className="hover:bg-white/5">
                                    <td className="p-3 text-slate-300 font-medium">{p.name}</td>
                                    <td className="p-3 text-right text-slate-400">{p.quantity}</td>
                                    <td className="p-3 text-right text-emerald-400">{formatCurrency(p.revenue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-8 text-center text-slate-500 italic">
                        Nenhum produto vendido através deste fornecedor ainda.
                    </div>
                )}
            </div>
        </div>
    </ModalWrapper>
  );
};

const KPICard = ({ title, value, subtext, icon }: any) => (
    <div className="bg-rs-card border border-rs-goldDim/20 p-4 rounded-xl shadow-sm flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-2">
            <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">{title}</span>
            {icon}
        </div>
        <div>
            <div className="text-xl font-bold text-slate-100 truncate" title={String(value)}>{value}</div>
            <div className="text-xs text-slate-500 mt-1">{subtext}</div>
        </div>
    </div>
);
