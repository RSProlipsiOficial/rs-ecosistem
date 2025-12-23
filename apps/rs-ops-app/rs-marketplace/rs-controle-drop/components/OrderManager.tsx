import React, { useState, useEffect } from 'react';
import { Order, OrderItem, Product, Customer, PaymentMethodConfig, OrderStatus, Supplier, ProductSupplier, User, ShippingConfig, AutomationLog, RMA, DistributionCenter, ProductStockLocation, Affiliate } from '../types';
import { Plus, Trash2, Edit2, DollarSign, Package, Truck, User as UserIcon, AlertCircle, Target, Zap, Warehouse, Tag } from 'lucide-react';
import { ModalWrapper } from './ModalWrapper';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';
import { fulfillmentService } from '../services/fulfillmentService';
import { TabButton } from './TabButton';

interface OrderManagerProps {
  orders: Order[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  productSuppliers: ProductSupplier[];
  paymentConfigs: PaymentMethodConfig[];
  shippingConfigs: ShippingConfig[];
  automationLogs: AutomationLog[];
  rmas: RMA[];
  distributionCenters: DistributionCenter[];
  stockLocations: ProductStockLocation[];
  onAdd: (order: Omit<Order, 'id'>) => void;
  onUpdate: (order: Order) => void;
  onDelete: (id: string) => void;
  onAddRma: (rma: Omit<RMA, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  currentUser: User;
  users: User[];
  initialSearch?: string;
  affiliates: Affiliate[];
}

const EMPTY_ORDER: Omit<Order, 'id'> = {
  date: new Date().toISOString().split('T')[0], customerId: '', customerName: '', items: [], itemsTotal: 0, discountTotal: 0,
  shippingCost: 0, shippingCharged: 0, paymentMethod: '', paymentFee: 0, platformFee: 0, otherExpenses: 0, status: 'New',
  trackingCode: '', shippingMethod: '', campaign: '', notes: '', salesChannel: 'Loja Própria', shippingDate: '', 
  estimatedDeliveryDate: '', actualDeliveryDate: '', postSaleEvents: [], userId: '',
  utmSource: '', utmMedium: '', utmCampaign: '', utmContent: '', utmTerm: ''
};
const EMPTY_NEW_ITEM = { productId: '', supplierId: '', quantity: 1 };

export const OrderManager: React.FC<OrderManagerProps> = ({ 
    orders, products, customers, suppliers, productSuppliers, paymentConfigs, shippingConfigs, affiliates,
    automationLogs, rmas, distributionCenters, stockLocations,
    onAdd, onUpdate, onDelete, onAddRma, currentUser, users, initialSearch 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Order | Omit<Order, 'id'>>(EMPTY_ORDER);
  const [activeTab, setActiveTab] = useState<'customer' | 'items' | 'shipping' | 'finance' | 'marketing'>('customer');
  
  const [newItem, setNewItem] = useState(EMPTY_NEW_ITEM);
  const [suggestedCenterId, setSuggestedCenterId] = useState<string | null>(null);
  
  const table = useDataTable({ initialData: orders, searchKeys: ['customerName', 'id'] });

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
      header: 'Cliente', accessor: 'customerName', sortable: true,
      render: (o) => <div className="font-bold text-slate-200">{o.customerName}</div>
    },
    {
      header: 'Fulfillment CD', accessor: 'fulfillmentCenterId', sortable: true,
      render: (o) => {
        const center = distributionCenters.find(cd => cd.id === o.fulfillmentCenterId);
        return <span className="text-xs text-slate-400 flex items-center gap-1.5"><Warehouse size={12}/> {center?.name || 'Não atribuído'}</span>;
      }
    },
    {
      header: 'Total', accessor: 'itemsTotal', sortable: true, headerClassName: 'text-right', cellClassName: 'text-right font-medium',
      render: (o) => `R$ ${(o.itemsTotal + o.shippingCharged).toFixed(2)}`
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
  
  const handleOpenModal = (order?: Order) => {
    setActiveTab('customer');
    if (order) {
      setEditingId(order.id);
      setFormData(order);
      const customer = customers.find(c => c.id === order.customerId);
      if (customer) {
        const bestCD = fulfillmentService.assignBestCD(order, customer, distributionCenters, stockLocations);
        setSuggestedCenterId(bestCD);
        if (!order.fulfillmentCenterId) {
            setFormData(prev => ({ ...prev, fulfillmentCenterId: bestCD || undefined }));
        }
      }
    } else {
      setEditingId(null);
      setFormData(EMPTY_ORDER);
      setSuggestedCenterId(null);
    }
    setIsModalOpen(true);
  };
  
  const calculateCommission = (items: OrderItem[]): number => {
    return items.reduce((total, item) => {
        const product = products.find(p => p.id === item.productId);
        const commissionPercent = product?.affiliateCommissionPercent || 0;
        return total + (item.unitPrice * item.quantity * (commissionPercent / 100));
    }, 0);
  };
  
  const handleSave = (e: React.FormEvent) => { 
    e.preventDefault();
    let orderToSave = { ...formData };
    
    if ((orderToSave as Order).affiliateId) {
        (orderToSave as Order).affiliateCommission = calculateCommission(orderToSave.items);
        if ((orderToSave as Order).commissionPaid === undefined) {
             (orderToSave as Order).commissionPaid = false;
        }
    } else {
        (orderToSave as Order).affiliateId = undefined;
        (orderToSave as Order).affiliateCommission = undefined;
        (orderToSave as Order).commissionPaid = undefined;
    }
    
    if (editingId) { onUpdate({ ...(orderToSave as Order) }); }
    else { onAdd({ ...orderToSave, userId: currentUser.id }); }
    setIsModalOpen(false);
  };

  const addItem = () => {
      if (!newItem.productId || newItem.quantity <= 0) return;
      const product = products.find(p => p.id === newItem.productId);
      if (product) {
          const supplierId = newItem.supplierId || productSuppliers.find(ps => ps.productId === product.id && ps.isDefault)?.supplierId || '';
          const unitCost = productSuppliers.find(ps => ps.productId === product.id && ps.supplierId === supplierId)?.costPrice || 0;
          
          const newItemObj: OrderItem = {
              id: crypto.randomUUID(),
              productId: product.id,
              productName: product.name,
              quantity: newItem.quantity,
              unitPrice: product.salePrice,
              unitCost: unitCost,
              supplierId: supplierId,
              discount: 0
          };
          
          const updatedItems = [...formData.items, newItemObj];
          const newTotal = updatedItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
          
          setFormData({ ...formData, items: updatedItems, itemsTotal: newTotal });
          setNewItem(EMPTY_NEW_ITEM);
      }
  };

  const removeItem = (itemId: string) => {
      const updatedItems = formData.items.filter(i => i.id !== itemId);
      const newTotal = updatedItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
      setFormData({ ...formData, items: updatedItems, itemsTotal: newTotal });
  };
  
  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-rs-gold">Gerenciamento de Pedidos</h2>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2"><Plus size={20} /> Novo Pedido</button>
      </div>
      
      <DataTable {...table} columns={columns} data={table.paginatedData} onSort={table.requestSort} onSearch={table.setSearchTerm} onPageChange={{next: table.nextPage, prev: table.prevPage, goTo: table.goToPage}} onItemsPerPageChange={table.handleItemsPerPageChange} searchPlaceholder="Buscar por cliente, ID..."/>
      
      <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? `Editar Pedido #${(formData as Order).id.slice(0,8)}` : 'Novo Pedido'} size="5xl">
      <form onSubmit={handleSave} className="flex flex-col h-full overflow-hidden">
        <div className="border-b border-white/10 px-6 shrink-0">
          <div className="flex gap-1 overflow-x-auto">
            <TabButton icon={<UserIcon size={16}/>} label="Cliente & Status" isActive={activeTab === 'customer'} onClick={() => setActiveTab('customer')} />
            <TabButton icon={<Package size={16}/>} label="Itens" isActive={activeTab === 'items'} onClick={() => setActiveTab('items')} />
            <TabButton icon={<Truck size={16}/>} label="Envio & Fulfillment" isActive={activeTab === 'shipping'} onClick={() => setActiveTab('shipping')} />
            <TabButton icon={<Target size={16}/>} label="Marketing & UTMs" isActive={activeTab === 'marketing'} onClick={() => setActiveTab('marketing')} />
            {editingId && <TabButton icon={<DollarSign size={16}/>} label="Financeiro" isActive={activeTab === 'finance'} onClick={() => setActiveTab('finance')} />}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'customer' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="label-text">Cliente</label>
                            <select 
                                value={formData.customerId} 
                                onChange={e => {
                                    const c = customers.find(cust => cust.id === e.target.value);
                                    setFormData({...formData, customerId: e.target.value, customerName: c?.name || '' });
                                }} 
                                className="input-field"
                                required
                            >
                                <option value="">Selecione...</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div><label className="label-text">Data do Pedido</label><input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="input-field"/></div>
                        <div>
                            <label className="label-text">Status</label>
                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as OrderStatus})} className="input-field">
                                <option value="New">Novo</option>
                                <option value="Packing">Em Separação</option>
                                <option value="Shipped">Enviado</option>
                                <option value="Delivered">Entregue</option>
                                <option value="Returned">Devolvido</option>
                                <option value="Refunded">Reembolsado</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div><label className="label-text">Canal de Venda</label><input type="text" value={formData.salesChannel} onChange={e => setFormData({...formData, salesChannel: e.target.value})} className="input-field"/></div>
                        <div><label className="label-text">Campanha (Opcional)</label><input type="text" value={formData.campaign} onChange={e => setFormData({...formData, campaign: e.target.value})} className="input-field"/></div>
                        <div><label className="label-text">Notas Internas</label><textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="input-field"/></div>
                    </div>
                </div>
            )}

            {activeTab === 'items' && (
                <div className="space-y-6">
                    <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                        <h4 className="font-bold text-slate-300 text-sm mb-3">Adicionar Produto</h4>
                        <div className="flex gap-2">
                            <select value={newItem.productId} onChange={e => setNewItem({...newItem, productId: e.target.value})} className="input-field flex-1">
                                <option value="">Selecione um produto...</option>
                                {products.filter(p => p.status === 'Active').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <input type="number" min="1" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})} className="input-field w-20"/>
                            <button type="button" onClick={addItem} className="btn-secondary">Adicionar</button>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        {formData.items.map((item, index) => (
                            <div key={item.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                                <div>
                                    <div className="font-bold text-slate-200">{item.productName}</div>
                                    <div className="text-xs text-slate-500">{item.quantity}x R$ {item.unitPrice.toFixed(2)}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="font-bold text-emerald-400">R$ {(item.unitPrice * item.quantity).toFixed(2)}</div>
                                    <button type="button" onClick={() => removeItem(item.id)} className="text-red-400 hover:bg-white/10 p-1 rounded"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                        {formData.items.length === 0 && <div className="text-center text-slate-500 py-4 italic">Nenhum item adicionado.</div>}
                    </div>
                    
                    <div className="flex justify-end text-xl font-bold text-rs-gold">
                        Total Itens: R$ {formData.itemsTotal.toFixed(2)}
                    </div>
                </div>
            )}

            {activeTab === 'shipping' && (
                <div className="space-y-6">
                     <div>
                         <label className="label-text-header"><Warehouse size={18}/> Centro de Distribuição (Fulfillment)</label>
                         <div className="bg-black/20 p-4 rounded-lg border border-white/5 space-y-3">
                             <div>
                                <label className="label-text">CD Responsável</label>
                                <select
                                    value={(formData as Order).fulfillmentCenterId || ''}
                                    onChange={e => setFormData({...formData, fulfillmentCenterId: e.target.value})}
                                    className="input-field"
                                >
                                    <option value="">-- Manual / Não Atribuído --</option>
                                    {distributionCenters.map(cd => (
                                        <option key={cd.id} value={cd.id}>{cd.name}</option>
                                    ))}
                                </select>
                             </div>
                             {suggestedCenterId && (
                                <div className="text-xs text-emerald-400 bg-emerald-900/20 p-2 rounded flex items-center gap-2">
                                    <Zap size={14}/> CD Sugerido pela roteirização: <span className="font-bold">{distributionCenters.find(cd => cd.id === suggestedCenterId)?.name}</span>
                                </div>
                             )}
                             {!(formData as Order).fulfillmentCenterId && !suggestedCenterId && (
                                <div className="text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded">Nenhum CD foi atribuído automaticamente. Verifique o CEP do cliente e o estoque.</div>
                             )}
                         </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div><label className="label-text">Método de Envio</label><input type="text" value={formData.shippingMethod} onChange={e => setFormData({...formData, shippingMethod: e.target.value})} className="input-field"/></div>
                            <div><label className="label-text">Custo do Frete (R$)</label><input type="number" step="0.01" value={formData.shippingCost} onChange={e => setFormData({...formData, shippingCost: parseFloat(e.target.value) || 0})} className="input-field"/></div>
                            <div><label className="label-text">Frete Cobrado do Cliente (R$)</label><input type="number" step="0.01" value={formData.shippingCharged} onChange={e => setFormData({...formData, shippingCharged: parseFloat(e.target.value) || 0})} className="input-field"/></div>
                        </div>
                        <div className="space-y-4">
                            <div><label className="label-text">Código de Rastreio</label><input type="text" value={formData.trackingCode} onChange={e => setFormData({...formData, trackingCode: e.target.value})} className="input-field font-mono"/></div>
                            <div><label className="label-text">Data de Envio</label><input type="date" value={formData.shippingDate} onChange={e => setFormData({...formData, shippingDate: e.target.value})} className="input-field"/></div>
                            <div><label className="label-text">Data Prevista de Entrega</label><input type="date" value={formData.estimatedDeliveryDate} onChange={e => setFormData({...formData, estimatedDeliveryDate: e.target.value})} className="input-field"/></div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'marketing' && (
                <div className="space-y-6">
                    <div>
                        <label className="label-text-header"><Tag size={18}/> Afiliado</label>
                        <div className="bg-black/20 p-4 rounded-lg border border-white/5 space-y-3">
                            <label className="label-text">Associar venda a um afiliado</label>
                            <select
                                value={(formData as Order).affiliateId || ''}
                                onChange={e => setFormData({...formData, affiliateId: e.target.value || undefined })}
                                className="input-field"
                            >
                                <option value="">Nenhum afiliado</option>
                                {affiliates.map(aff => (
                                    <option key={aff.id} value={aff.id}>{aff.name}</option>
                                ))}
                            </select>
                            {(formData as Order).affiliateId && (
                                 <p className="text-xs text-slate-400">Comissão calculada: <span className="font-bold text-emerald-400">R$ {calculateCommission(formData.items).toFixed(2)}</span></p>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="label-text-header"><Target size={18}/> UTMs & Rastreamento</label>
                        <div className="bg-black/20 p-4 rounded-lg border border-white/5 grid grid-cols-2 gap-4">
                             <div><label className="label-text">utm_source</label><input type="text" value={formData.utmSource || ''} onChange={e => setFormData({...formData, utmSource: e.target.value})} className="input-field"/></div>
                             <div><label className="label-text">utm_medium</label><input type="text" value={formData.utmMedium || ''} onChange={e => setFormData({...formData, utmMedium: e.target.value})} className="input-field"/></div>
                             <div><label className="label-text">utm_campaign</label><input type="text" value={formData.utmCampaign || ''} onChange={e => setFormData({...formData, utmCampaign: e.target.value})} className="input-field"/></div>
                             <div><label className="label-text">utm_content</label><input type="text" value={formData.utmContent || ''} onChange={e => setFormData({...formData, utmContent: e.target.value})} className="input-field"/></div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'finance' && (
                <div className="space-y-6">
                    {(formData as Order).antifraud && (
                        <div className={`p-4 rounded-lg border ${
                            (formData as Order).antifraud?.status === 'approved' ? 'bg-emerald-900/20 border-emerald-500/30' : 
                            (formData as Order).antifraud?.status === 'rejected' ? 'bg-red-900/20 border-red-500/30' : 
                            'bg-yellow-900/20 border-yellow-500/30'
                        }`}>
                            <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                                <AlertCircle size={16}/> Análise Antifraude
                            </h4>
                            <div className="flex justify-between items-center text-sm">
                                <span>Status: <span className="font-bold uppercase">{(formData as Order).antifraud?.status}</span></span>
                                <span>Score: <span className="font-bold">{(formData as Order).antifraud?.score}/100</span></span>
                            </div>
                            {(formData as Order).antifraud?.status === 'rejected' && !(formData as Order).antifraud?.status.includes('manual') && (
                                <button 
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, antifraud: { ...prev.antifraud!, status: 'approved' }, status: 'New' }))}
                                    className="mt-3 text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-white"
                                >
                                    Aprovar Manualmente (Risco do Lojista)
                                </button>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label-text">Método de Pagamento</label><input type="text" value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="input-field"/></div>
                        <div><label className="label-text">Taxa Gateway (R$)</label><input type="number" step="0.01" value={formData.paymentFee} onChange={e => setFormData({...formData, paymentFee: parseFloat(e.target.value) || 0})} className="input-field"/></div>
                        <div><label className="label-text">Taxa Plataforma (R$)</label><input type="number" step="0.01" value={formData.platformFee} onChange={e => setFormData({...formData, platformFee: parseFloat(e.target.value) || 0})} className="input-field"/></div>
                        <div><label className="label-text">Outras Despesas (R$)</label><input type="number" step="0.01" value={formData.otherExpenses} onChange={e => setFormData({...formData, otherExpenses: parseFloat(e.target.value) || 0})} className="input-field"/></div>
                    </div>
                </div>
            )}
        </div>

        <div className="mt-auto p-6 border-t border-white/10 flex justify-end items-center shrink-0">
          <div className="flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Salvar Pedido</button>
          </div>
        </div>
      </form>
      </ModalWrapper>

      <style>{`.label-text{display:block;font-size:0.75rem;color:#94a3b8;margin-bottom:0.25rem}.label-text-header{font-size:0.875rem;font-weight:700;color:#d1d5db;margin-bottom:0.75rem;display:flex;align-items:center;gap:0.5rem}.input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e2e8f0;outline:none}.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem;}.btn-secondary{border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem;}`}</style>
    </div>
  );
};