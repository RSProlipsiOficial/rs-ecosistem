
import React, { useState, useMemo, useEffect } from 'react';
import { Order, OrderItem, Product, Customer, PaymentMethodConfig, OrderStatus, PostSaleEvent, Supplier, ProductSupplier, User, ShippingConfig } from '../types';
import { Plus, Trash2, Edit2, X, DollarSign, Package, Truck, User as UserIcon, AlertCircle, ClipboardList, Target } from 'lucide-react';
import { ModalWrapper } from './ModalWrapper';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';

interface OrderManagerProps {
  orders: Order[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  productSuppliers: ProductSupplier[];
  paymentConfigs: PaymentMethodConfig[];
  shippingConfigs: ShippingConfig[];
  onAdd: (order: Omit<Order, 'id'>) => void;
  onUpdate: (order: Order) => void;
  onDelete: (id: string) => void;
  currentUser: User;
  users: User[];
  initialSearch?: string;
}

const EMPTY_ORDER: Omit<Order, 'id'> = {
  date: new Date().toISOString().split('T')[0], customerId: '', customerName: '', items: [], itemsTotal: 0, discountTotal: 0,
  shippingCost: 0, shippingCharged: 0, paymentMethod: '', paymentFee: 0, platformFee: 0, otherExpenses: 0, status: 'New',
  trackingCode: '', shippingMethod: '', campaign: '', notes: '', salesChannel: 'Loja Própria', shippingDate: '', 
  estimatedDeliveryDate: '', actualDeliveryDate: '', postSaleEvents: [], userId: '',
  utmSource: '', utmMedium: '', utmCampaign: '', utmContent: '', utmTerm: ''
};
const EMPTY_POST_SALE_EVENT: Omit<PostSaleEvent, 'id' | 'orderId'> = { type: 'Partial Refund', amount: 0, date: new Date().toISOString().split('T')[0], reason: '' };
const EMPTY_NEW_ITEM = { productId: '', supplierId: '', quantity: 1 };

export const OrderManager: React.FC<OrderManagerProps> = ({ orders, products, customers, suppliers, productSuppliers, paymentConfigs, shippingConfigs, onAdd, onUpdate, onDelete, currentUser, users, initialSearch }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Order | Omit<Order, 'id'>>(EMPTY_ORDER);
  const [activeTab, setActiveTab] = useState<'customer' | 'items' | 'shipping' | 'finance' | 'marketing'>('customer');
  const [newItem, setNewItem] = useState(EMPTY_NEW_ITEM);
  
  // Enhance orders with searchable content including product names (PRT-029)
  const ordersWithSearch = useMemo(() => orders.map(o => ({
      ...o,
      _searchContent: `${o.customerName} ${o.id} ${o.items.map(i => i.productName).join(' ')}`
  })), [orders]);

  const table = useDataTable({ initialData: ordersWithSearch, searchKeys: ['_searchContent'] });

  // Sync initial search from prop
  useEffect(() => {
      if (initialSearch) {
          table.setSearchTerm(initialSearch);
      }
  }, [initialSearch]);

  const getStatusColor = (status: OrderStatus) => ({
    'New': 'bg-blue-500/10 text-blue-400', 'Packing': 'bg-yellow-500/10 text-yellow-400',
    'Shipped': 'bg-purple-500/10 text-purple-400', 'Delivered': 'bg-emerald-500/10 text-emerald-400',
    'Returned': 'bg-red-500/10 text-red-400', 'Refunded': 'bg-slate-500/10 text-slate-400'
  }[status]);
  
  const columns: Column<Order>[] = [
    {
      header: 'Pedido/Data', accessor: 'date', sortable: true,
      render: (o) => (
        <div>
          <div className="font-mono text-xs text-rs-gold">#{o.id.slice(0,8)}</div>
          <div className="text-slate-300">{o.date.split('-').reverse().join('/')}</div>
        </div>
      )
    },
    {
      header: 'Cliente/Canal', accessor: 'customerName', sortable: true,
      render: (o) => (
        <div>
          <div className="font-bold text-slate-200">{o.customerName}</div>
          <div className="text-xs text-slate-500">{o.salesChannel} {o.utmSource ? `via ${o.utmSource}` : ''}</div>
        </div>
      )
    },
    ...(currentUser.role === 'Admin' ? [{
        header: 'Logista', accessor: 'userId', sortable: true,
        render: (o: Order) => <span className="text-xs text-slate-400">{users.find(u => u.id === o.userId)?.name || 'N/A'}</span>
    } as Column<Order>] : []),
    {
      header: 'Total', accessor: 'itemsTotal', sortable: true, headerClassName: 'text-right', cellClassName: 'text-right font-medium',
      render: (o) => `R$ ${(o.itemsTotal + o.shippingCharged).toFixed(2)}`
    },
    {
      header: 'Lucro', accessor: 'profit', sortable: false, headerClassName: 'text-right', cellClassName: 'text-right font-bold',
      render: (o) => {
        const profit = (o.itemsTotal + o.shippingCharged - o.discountTotal) - (o.items.reduce((a,i)=>a+i.unitCost*i.quantity,0) + o.shippingCost + o.paymentFee + o.platformFee + o.otherExpenses);
        return <span className={profit > 0 ? 'text-emerald-400' : 'text-red-400'}>R$ {profit.toFixed(2)}</span>;
      }
    },
    {
      header: 'Status', accessor: 'status', sortable: true, headerClassName: 'text-center', cellClassName: 'text-center',
      render: (o) => <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${getStatusColor(o.status)}`}>{o.status}</span>
    },
    {
      header: 'Ações', accessor: 'actions', headerClassName: 'text-center', cellClassName: 'text-center',
      render: (o) => (
        <div className="flex justify-center gap-2">
          <button onClick={() => handleOpenModal(o)} className="p-1.5 text-slate-400 hover:text-blue-400"><Edit2 size={16}/></button>
          <button onClick={() => onDelete(o.id)} className="p-1.5 text-slate-400 hover:text-red-400"><Trash2 size={16}/></button>
        </div>
      )
    }
  ];

  const calculateFees = (methodName: string, gross: number) => {
     const config = paymentConfigs.find(c => c.name === methodName);
     if (!config) return 0;
     return parseFloat((gross * (config.defaultFeePercent / 100) + config.defaultFeeFixed).toFixed(2));
  };
  
  const updateFinancials = (data: Omit<Order, 'id'> | Order) => {
    const itemsTotal = data.items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
    const gross = itemsTotal + data.shippingCharged - data.discountTotal;
    const fee = calculateFees(data.paymentMethod, gross);
    return { ...data, itemsTotal, paymentFee: fee };
  };

  const selectedProductForNewItem = useMemo(() => products.find(p => p.id === newItem.productId), [products, newItem.productId]);

  const handleOpenModal = (order?: Order) => {
    setActiveTab('customer');
    if (order) {
      setEditingId(order.id);
      setFormData(order);
    } else {
      setEditingId(null);
      setFormData(EMPTY_ORDER);
    }
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
      if(!selectedProductForNewItem) return;
      const supplierCost = productSuppliers.find(ps => ps.productId === newItem.productId && ps.supplierId === newItem.supplierId)?.costPrice || 0;
      
      const item: OrderItem = {
          id: crypto.randomUUID(),
          productId: newItem.productId,
          supplierId: newItem.supplierId,
          productName: selectedProductForNewItem.name,
          quantity: newItem.quantity,
          unitPrice: selectedProductForNewItem.salePrice,
          unitCost: supplierCost,
          discount: 0
      };
      
      setFormData({
          ...formData,
          items: [...formData.items, item]
      });
      setNewItem(EMPTY_NEW_ITEM);
  };

  const handleRemoveItem = (itemId: string) => {
      setFormData({
          ...formData,
          items: formData.items.filter(i => i.id !== itemId)
      });
  };

  const handleSave = (e: React.FormEvent) => { 
    e.preventDefault();
    const finalData = updateFinancials(formData);
    if (editingId) {
        onUpdate({ ...finalData, id: editingId, userId: (finalData as Order).userId || currentUser.id });
    } else {
        onAdd({ ...finalData, userId: currentUser.id });
    }
    setIsModalOpen(false);
   };
  
  const availableSuppliers = useMemo(() => {
     const supplierIds = productSuppliers.filter(ps => ps.productId === newItem.productId).map(ps => ps.supplierId);
     return suppliers.filter(s => supplierIds.includes(s.id));
  }, [newItem.productId, productSuppliers, suppliers]);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-rs-gold">Gerenciamento de Pedidos</h2>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2"><Plus size={20} /> Novo Pedido</button>
      </div>
      
      <DataTable {...table} columns={columns} data={table.paginatedData} onSort={table.requestSort} onSearch={table.setSearchTerm} onPageChange={{next: table.nextPage, prev: table.prevPage, goTo: table.goToPage}} onItemsPerPageChange={table.handleItemsPerPageChange} searchPlaceholder="Buscar por cliente, ID ou produto..."/>
      
      <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? `Editar Pedido #${(formData as Order).id.slice(0,8)}` : 'Novo Pedido'} size="5xl">
      <form onSubmit={handleSave} className="flex flex-col h-full overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-white/10 px-6 shrink-0">
          <div className="flex gap-1 overflow-x-auto">
            <TabButton icon={<UserIcon size={16}/>} label="Cliente & Status" isActive={activeTab === 'customer'} onClick={() => setActiveTab('customer')} />
            <TabButton icon={<Package size={16}/>} label="Itens" isActive={activeTab === 'items'} onClick={() => setActiveTab('items')} />
            <TabButton icon={<Truck size={16}/>} label="Envio" isActive={activeTab === 'shipping'} onClick={() => setActiveTab('shipping')} />
            <TabButton icon={<DollarSign size={16}/>} label="Financeiro" isActive={activeTab === 'finance'} onClick={() => setActiveTab('finance')} />
            <TabButton icon={<Target size={16}/>} label="Atribuição (UTM)" isActive={activeTab === 'marketing'} onClick={() => setActiveTab('marketing')} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'customer' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="label-text-header"><UserIcon size={18}/>Dados do Cliente</h3>
                  <div className="space-y-4">
                      <div>
                        <label className="label-text">Cliente</label>
                        <select
                          required
                          value={formData.customerId}
                          onChange={(e) => {
                            const cust = customers.find(c => c.id === e.target.value);
                            setFormData({...formData, customerId: cust?.id || '', customerName: cust?.name || ''});
                          }}
                          className="input-field"
                        >
                          <option value="">Selecione um cliente existente</option>
                          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label-text">Nome do Cliente (como no pedido)</label>
                        <input type="text" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="input-field" />
                      </div>
                      <div>
                        <label className="label-text">Data do Pedido</label>
                        <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="input-field" />
                      </div>
                  </div>
                </div>
                 <div>
                  <h3 className="label-text-header"><ClipboardList size={18}/>Status Geral</h3>
                   <div className="space-y-4">
                      <div>
                          <label className="label-text">Status do Pedido</label>
                          <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as OrderStatus})} className="input-field">
                            {Object.keys(getStatusColor).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                      </div>
                       <div>
                          <label className="label-text">Canal de Venda (Macro)</label>
                          <input type="text" value={formData.salesChannel} onChange={e => setFormData({...formData, salesChannel: e.target.value})} className="input-field" placeholder="Ex: Loja Própria, Mercado Livre..." />
                       </div>
                   </div>
                 </div>
             </div>
          )}

          {activeTab === 'marketing' && (
              <div className="space-y-6">
                  <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                          <Target className="text-purple-400" size={20}/>
                          <h3 className="font-bold text-slate-200">Rastreamento de Origem (UTM)</h3>
                      </div>
                      <p className="text-sm text-slate-400 mb-4">
                          Estes dados são capturados automaticamente se o cliente usou um Link Encurtado do sistema.
                          Você também pode preencher manualmente para atribuir a venda a uma campanha.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="label-text">Origem (utm_source)</label>
                              <input 
                                  type="text" 
                                  value={formData.utmSource || ''} 
                                  onChange={e => setFormData({...formData, utmSource: e.target.value})} 
                                  className="input-field" 
                                  placeholder="Ex: facebook, google, newsletter"
                              />
                          </div>
                          <div>
                              <label className="label-text">Mídia (utm_medium)</label>
                              <input 
                                  type="text" 
                                  value={formData.utmMedium || ''} 
                                  onChange={e => setFormData({...formData, utmMedium: e.target.value})} 
                                  className="input-field" 
                                  placeholder="Ex: cpc, banner, email"
                              />
                          </div>
                          <div>
                              <label className="label-text">Campanha (utm_campaign)</label>
                              <input 
                                  type="text" 
                                  value={formData.utmCampaign || ''} 
                                  onChange={e => setFormData({...formData, utmCampaign: e.target.value})} 
                                  className="input-field" 
                                  placeholder="Ex: black_friday, verao_2024"
                              />
                          </div>
                          <div>
                              <label className="label-text">Termo (utm_term)</label>
                              <input 
                                  type="text" 
                                  value={formData.utmTerm || ''} 
                                  onChange={e => setFormData({...formData, utmTerm: e.target.value})} 
                                  className="input-field" 
                                  placeholder="Ex: tenis+corrida"
                              />
                          </div>
                           <div className="md:col-span-2">
                              <label className="label-text">Conteúdo (utm_content)</label>
                              <input 
                                  type="text" 
                                  value={formData.utmContent || ''} 
                                  onChange={e => setFormData({...formData, utmContent: e.target.value})} 
                                  className="input-field" 
                                  placeholder="Ex: video_01, imagem_azul"
                              />
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'items' && (
             <div className="space-y-4">
                 <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                    <h3 className="label-text-header">Adicionar Item</h3>
                    <div className="flex gap-2 items-end">
                       <div className="flex-1">
                          <label className="label-text">Produto</label>
                          <select value={newItem.productId} onChange={e => setNewItem({...newItem, productId: e.target.value, supplierId: ''})} className="input-field">
                             <option value="">Selecione...</option>
                             {products.filter(p => p.status === 'Active').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                       </div>
                       <div className="flex-1">
                          <label className="label-text">Fornecedor</label>
                          <select value={newItem.supplierId} onChange={e => setNewItem({...newItem, supplierId: e.target.value})} className="input-field" disabled={!newItem.productId}>
                             <option value="">Selecione...</option>
                             {availableSuppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                       </div>
                       <div className="w-24">
                          <label className="label-text">Qtd</label>
                          <input type="number" min="1" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value)||1})} className="input-field"/>
                       </div>
                       <button type="button" onClick={handleAddItem} className="btn-primary h-[38px] flex items-center justify-center px-4" disabled={!newItem.productId || !newItem.supplierId}><Plus/></button>
                    </div>
                 </div>
                 
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-white/5 text-slate-400 text-xs uppercase">
                          <tr>
                             <th className="p-3">Produto</th>
                             <th className="p-3 text-center">Qtd</th>
                             <th className="p-3 text-right">Unitário</th>
                             <th className="p-3 text-right">Total</th>
                             <th className="p-3"></th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {formData.items.map(item => (
                             <tr key={item.id}>
                                <td className="p-3 font-medium text-slate-300">{item.productName}</td>
                                <td className="p-3 text-center">{item.quantity}</td>
                                <td className="p-3 text-right">R$ {item.unitPrice.toFixed(2)}</td>
                                <td className="p-3 text-right">R$ {(item.unitPrice * item.quantity).toFixed(2)}</td>
                                <td className="p-3 text-center"><button type="button" onClick={() => handleRemoveItem(item.id)} className="text-slate-500 hover:text-red-400"><Trash2 size={14}/></button></td>
                             </tr>
                          ))}
                          {formData.items.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-slate-500 italic">Nenhum item adicionado</td></tr>}
                       </tbody>
                    </table>
                 </div>
             </div>
          )}

          {activeTab === 'shipping' && (
             <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-4">
                     <div>
                        <label className="label-text">Método de Envio</label>
                        <select value={formData.shippingMethod} onChange={e => {
                            const method = shippingConfigs.find(s => s.name === e.target.value);
                            setFormData({...formData, shippingMethod: e.target.value, shippingCost: method ? method.defaultCost : formData.shippingCost});
                        }} className="input-field">
                           <option value="">Selecione...</option>
                           {shippingConfigs.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                     </div>
                     <div><label className="label-text">Código de Rastreio</label><input type="text" value={formData.trackingCode} onChange={e => setFormData({...formData, trackingCode: e.target.value})} className="input-field"/></div>
                     <div><label className="label-text">Custo de Frete (R$)</label><input type="number" step="0.01" value={formData.shippingCost} onChange={e => setFormData({...formData, shippingCost: parseFloat(e.target.value)||0})} className="input-field"/></div>
                     <div><label className="label-text">Frete Cobrado do Cliente (R$)</label><input type="number" step="0.01" value={formData.shippingCharged} onChange={e => setFormData({...formData, shippingCharged: parseFloat(e.target.value)||0})} className="input-field"/></div>
                 </div>
                 <div className="space-y-4">
                     <div><label className="label-text">Data de Envio</label><input type="date" value={formData.shippingDate} onChange={e => setFormData({...formData, shippingDate: e.target.value})} className="input-field"/></div>
                     <div><label className="label-text">Previsão Entrega</label><input type="date" value={formData.estimatedDeliveryDate} onChange={e => setFormData({...formData, estimatedDeliveryDate: e.target.value})} className="input-field"/></div>
                     <div><label className="label-text">Entrega Realizada</label><input type="date" value={formData.actualDeliveryDate} onChange={e => setFormData({...formData, actualDeliveryDate: e.target.value})} className="input-field"/></div>
                 </div>
             </div>
          )}

          {activeTab === 'finance' && (
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="label-text">Método de Pagamento</label>
                        <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="input-field">
                           <option value="">Selecione...</option>
                           {paymentConfigs.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                     </div>
                     <div><label className="label-text">Taxa Pagamento (R$)</label><input type="number" step="0.01" value={formData.paymentFee} onChange={e => setFormData({...formData, paymentFee: parseFloat(e.target.value)||0})} className="input-field"/></div>
                     <div><label className="label-text">Taxa Plataforma (R$)</label><input type="number" step="0.01" value={formData.platformFee} onChange={e => setFormData({...formData, platformFee: parseFloat(e.target.value)||0})} className="input-field"/></div>
                     <div><label className="label-text">Descontos (R$)</label><input type="number" step="0.01" value={formData.discountTotal} onChange={e => setFormData({...formData, discountTotal: parseFloat(e.target.value)||0})} className="input-field"/></div>
                 </div>
                 <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                     <div className="flex justify-between items-center mb-2">
                         <span className="text-slate-400">Total Produtos</span>
                         <span className="text-slate-200">R$ {formData.items.reduce((a,i)=>a+i.unitPrice*i.quantity,0).toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center mb-2">
                         <span className="text-slate-400">Frete Cobrado</span>
                         <span className="text-slate-200">R$ {formData.shippingCharged.toFixed(2)}</span>
                     </div>
                     <div className="h-px bg-white/10 my-2"></div>
                     <div className="flex justify-between items-center text-lg font-bold">
                         <span className="text-rs-gold">Total Pedido</span>
                         <span className="text-rs-gold">R$ {(formData.items.reduce((a,i)=>a+i.unitPrice*i.quantity,0) + formData.shippingCharged - formData.discountTotal).toFixed(2)}</span>
                     </div>
                 </div>
              </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto p-6 border-t border-white/10 flex justify-end items-center shrink-0">
          <div className="flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Salvar Pedido</button>
          </div>
        </div>
      </form>
      </ModalWrapper>

      <style>{`.label-text{display:block;font-size:0.75rem;color:#94a3b8;margin-bottom:0.25rem}.label-text-header{font-size:0.875rem;font-weight:700;color:#d1d5db;margin-bottom:0.75rem;display:flex;align-items:center;gap:0.5rem}.input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e2e8f0;outline:none}.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem}.btn-secondary{border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem}`}</style>
    </div>
  );
};

const TabButton = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
    <button type="button" onClick={onClick} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${ isActive ? 'border-rs-gold text-rs-gold' : 'border-transparent text-slate-400 hover:text-slate-100' }`}>
        {icon} {label}
    </button>
);
