import React, { useState, useEffect, useMemo } from 'react';
import { Order, OrderItem, Product, Customer, PaymentMethodConfig, OrderStatus, Supplier, ProductSupplier, User, ShippingConfig, AutomationLog, RMA, DistributionCenter, ProductStockLocation, Affiliate } from '../types';
import { Plus, Trash2, Edit2, DollarSign, Package, Truck, User as UserIcon, AlertCircle, Target, Zap, Warehouse, Tag, Mail, Phone, MapPin, IdCard, RotateCcw, Eye, CalendarDays, BadgeDollarSign, ShieldCheck, Clock3, Save } from 'lucide-react';
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
  onAdd: (order: Omit<Order, 'id'>) => void | Promise<void>;
  onUpdate: (order: Order) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onCreateCustomer: (customer: Omit<Customer, 'id'>) => Customer | Promise<Customer | void>;
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
const EMPTY_CUSTOMER_DRAFT: Omit<Customer, 'id'> = {
  name: '',
  email: '',
  phone: '',
  document: '',
  address: {
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  },
  notes: '',
  userId: '',
};

type OrderTableRow = {
  id: string;
  date: string;
  customerName: string;
  customerDocument: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  itemSummary: string;
  fulfillmentCenterName: string;
  total: number;
  status: OrderStatus;
  trackingCode: string;
  salesChannel: string;
  campaign: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  order: Order;
};

export const OrderManager: React.FC<OrderManagerProps> = ({ 
    orders, products, customers, suppliers, productSuppliers, paymentConfigs, shippingConfigs, affiliates,
    automationLogs, rmas, distributionCenters, stockLocations,
    onAdd, onUpdate, onDelete, onCreateCustomer, onAddRma, currentUser, users, initialSearch 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Order | Omit<Order, 'id'>>(EMPTY_ORDER);
  const [activeTab, setActiveTab] = useState<'customer' | 'items' | 'shipping' | 'finance' | 'marketing'>('customer');
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [customerDraft, setCustomerDraft] = useState<Omit<Customer, 'id'>>(EMPTY_CUSTOMER_DRAFT);
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);
  
  const [newItem, setNewItem] = useState(EMPTY_NEW_ITEM);
  const [suggestedCenterId, setSuggestedCenterId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [centerFilter, setCenterFilter] = useState<'all' | string>('all');
  const [utmFilter, setUtmFilter] = useState<'all' | string>('all');
  const [isSaving, setIsSaving] = useState(false);
  
  const orderRows = useMemo<OrderTableRow[]>(() => {
    return orders.map((order) => {
      const customer = customers.find((item) => item.id === order.customerId);
      const center = distributionCenters.find((cd) => cd.id === order.fulfillmentCenterId);
      const itemSummary = order.items.map((item) => `${item.productName} x${item.quantity}`).join(', ');
      const customerAddress = customer?.address
        ? [
            customer.address.street,
            customer.address.number,
            customer.address.complement,
            customer.address.neighborhood,
            customer.address.city,
            customer.address.state,
            customer.address.zipCode,
          ].filter(Boolean).join(', ')
        : (((order as any).shippingAddress as string) || '');

      return {
        id: order.id,
        date: order.date,
        customerName: order.customerName,
        customerDocument: customer?.document || ((order as any).customerDocument as string) || '',
        customerEmail: customer?.email || ((order as any).customerEmail as string) || '',
        customerPhone: customer?.phone || ((order as any).customerPhone as string) || '',
        customerAddress,
        itemSummary,
        fulfillmentCenterName: center?.name || 'Nao atribuido',
        total: order.itemsTotal + order.shippingCharged,
        status: order.status,
        trackingCode: order.trackingCode || '',
        salesChannel: order.salesChannel || '',
        campaign: order.campaign || '',
        utmSource: order.utmSource || '',
        utmMedium: order.utmMedium || '',
        utmCampaign: order.utmCampaign || '',
        utmContent: order.utmContent || '',
        utmTerm: order.utmTerm || '',
        order,
      };
    });
  }, [orders, customers, distributionCenters]);

  const filteredRows = useMemo(() => {
    return orderRows.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) {
        return false;
      }
      if (centerFilter !== 'all' && row.order.fulfillmentCenterId !== centerFilter) {
        return false;
      }
      if (utmFilter !== 'all' && row.utmSource !== utmFilter) {
        return false;
      }
      return true;
    });
  }, [orderRows, statusFilter, centerFilter, utmFilter]);

  const table = useDataTable({
    initialData: filteredRows,
    searchKeys: [
      'id',
      'customerName',
      'customerDocument',
      'customerEmail',
      'customerPhone',
      'customerAddress',
      'itemSummary',
      'fulfillmentCenterName',
      'trackingCode',
      'salesChannel',
      'campaign',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
    ],
  });

  useEffect(() => {
      if (initialSearch) {
          table.setSearchTerm(initialSearch);
      }
  }, [initialSearch]);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === formData.customerId),
    [customers, formData.customerId]
  );

  const selectedCenter = useMemo(
    () => distributionCenters.find((center) => center.id === (formData as Order).fulfillmentCenterId),
    [distributionCenters, (formData as Order).fulfillmentCenterId]
  );

  const selectedCustomerAddress = selectedCustomer?.address
    ? [
        selectedCustomer.address.street,
        selectedCustomer.address.number,
        selectedCustomer.address.complement,
        selectedCustomer.address.neighborhood,
        `${selectedCustomer.address.city} - ${selectedCustomer.address.state}`,
        selectedCustomer.address.zipCode,
      ]
        .filter(Boolean)
        .join(', ')
    : '';

  const availableUtmSources = useMemo(
    () => Array.from(new Set(orderRows.map((row) => row.utmSource).filter(Boolean))).sort(),
    [orderRows]
  );

  const viewedOrder = useMemo(
    () => orders.find((order) => order.id === viewingOrderId) || null,
    [orders, viewingOrderId]
  );

  const viewedOrderCustomer = useMemo(
    () => customers.find((customer) => customer.id === viewedOrder?.customerId),
    [customers, viewedOrder]
  );

  const handleCustomerDraftChange = (field: keyof Omit<Customer, 'id'>, value: unknown) => {
    setCustomerDraft((prev) => ({ ...prev, [field]: value } as Omit<Customer, 'id'>));
  };

  const handleCustomerAddressChange = (field: keyof Customer['address'], value: string) => {
    setCustomerDraft((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const orderMetrics = useMemo(() => {
    const revenue = filteredRows.reduce((total, row) => total + row.total, 0);
    const tracked = filteredRows.filter((row) => row.utmSource || row.utmCampaign).length;
    const shipped = filteredRows.filter((row) => row.status === 'Shipped' || row.status === 'Delivered').length;

    return {
      totalOrders: filteredRows.length,
      revenue,
      tracked,
      shipped,
    };
  }, [filteredRows]);

  useEffect(() => {
    if (!isModalOpen || !selectedCustomer) {
      return;
    }

    const bestCD = fulfillmentService.assignBestCD(formData as Order, selectedCustomer, distributionCenters, stockLocations);
    setSuggestedCenterId(bestCD);

    setFormData((prev) => {
      const nextCenterId = (prev as Order).fulfillmentCenterId || bestCD || undefined;
      if (prev.customerName === selectedCustomer.name && (prev as Order).fulfillmentCenterId === nextCenterId) {
        return prev;
      }

      return {
        ...prev,
        customerName: selectedCustomer.name,
        fulfillmentCenterId: nextCenterId,
      };
    });
  }, [
    isModalOpen,
    selectedCustomer,
    distributionCenters,
    stockLocations,
    formData.customerId,
    formData.items,
  ]);

  const getStatusColor = (status: OrderStatus) => ({
    'New': 'bg-blue-500/10 text-blue-400', 'Packing': 'bg-yellow-500/10 text-yellow-400',
    'Shipped': 'bg-purple-500/10 text-purple-400', 'Delivered': 'bg-emerald-500/10 text-emerald-400',
    'Returned': 'bg-red-500/10 text-red-400', 'Refunded': 'bg-slate-500/10 text-slate-400'
  }[status]);
  
  const columns: Column<OrderTableRow>[] = [
    {
      header: 'Pedido/Data', accessor: 'date', sortable: true,
      render: (row) => (
        <div>
          <div className="font-mono text-xs text-rs-gold">#{row.id.slice(0,8)}</div>
          <div className="text-slate-300">{row.date.split('-').reverse().join('/')}</div>
        </div>
      )
    },
    {
      header: 'Cliente', accessor: 'customerName', sortable: true,
      render: (row) => (
        <div className="space-y-1">
          <div className="font-bold text-slate-200">{row.customerName}</div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Mail size={12} />
            <span>{row.customerEmail || 'Sem e-mail'}</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <IdCard size={12} />
            <span>{row.customerDocument || 'Sem documento'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Itens & Entrega', accessor: 'itemSummary', sortable: true,
      render: (row) => (
        <div className="space-y-1">
          <div className="text-xs text-slate-300 line-clamp-2">{row.itemSummary || 'Nenhum item'}</div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Warehouse size={12} />
            <span>{row.fulfillmentCenterName}</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <MapPin size={12} />
            <span className="line-clamp-1">{row.customerAddress || 'Endereço não informado'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Origem & UTM', accessor: 'utmCampaign', sortable: true,
      render: (row) => (
        <div className="space-y-1">
          <div className="text-xs text-slate-300">{row.salesChannel || 'Canal não informado'}</div>
          <div className="text-xs text-slate-500">
            {row.utmSource || row.utmCampaign
              ? `${row.utmSource || 'utm_source'} / ${row.utmCampaign || 'utm_campaign'}`
              : 'Sem rastreamento'}
          </div>
          {row.trackingCode ? (
            <div className="font-mono text-[10px] text-rs-gold">Rastreio: {row.trackingCode}</div>
          ) : null}
        </div>
      )
    },
    {
      header: 'Total', accessor: 'total', sortable: true, headerClassName: 'text-right', cellClassName: 'text-right font-medium',
      render: (row) => `R$ ${row.total.toFixed(2)}`
    },
    {
      header: 'Status', accessor: 'status', sortable: true, headerClassName: 'text-center', cellClassName: 'text-center',
      render: (row) => <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${getStatusColor(row.status)}`}>{row.status}</span>
    },
    {
      header: 'Ações', accessor: 'actions', headerClassName: 'text-center', cellClassName: 'text-center',
      render: (row) => (
        <div className="flex justify-center gap-2">
          <button type="button" onClick={() => setViewingOrderId(row.id)} className="p-1.5 text-slate-400 hover:text-rs-gold" title="Detalhes do pedido"><Eye size={16}/></button>
          <button onClick={() => handleOpenModal(row.order)} className="p-1.5 text-slate-400 hover:text-blue-400"><Edit2 size={16}/></button>
          <button onClick={() => void onDelete(row.id)} className="p-1.5 text-slate-400 hover:text-red-400"><Trash2 size={16}/></button>
        </div>
      )
    }
  ];
  
  const handleOpenModal = (order?: Order) => {
    setActiveTab('customer');
    if (order) {
      setEditingId(order.id);
      setFormData(order);
      setCustomerMode('existing');
      setCustomerDraft(EMPTY_CUSTOMER_DRAFT);
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
      setCustomerMode('existing');
      setCustomerDraft({
        ...EMPTY_CUSTOMER_DRAFT,
        userId: currentUser.id,
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveInlineCustomer = async () => {
    if (!customerDraft.name.trim() || !customerDraft.phone.trim()) {
      window.alert('Informe pelo menos nome e telefone do cliente.');
      return;
    }

    setIsSavingCustomer(true);
    try {
      const createdCustomer = await onCreateCustomer({
        ...customerDraft,
        userId: currentUser.id,
      });

      if (!createdCustomer || typeof createdCustomer !== 'object' || !('id' in createdCustomer)) {
        throw new Error('Cliente criado sem retorno vÃ¡lido.');
      }

      setFormData((prev) => ({
        ...prev,
        customerId: createdCustomer.id,
        customerName: createdCustomer.name,
      }));
      setCustomerMode('existing');
      setCustomerDraft({
        ...EMPTY_CUSTOMER_DRAFT,
        userId: currentUser.id,
      });
    } catch (error: any) {
      window.alert(error?.message || 'NÃ£o foi possÃ­vel cadastrar o cliente.');
    } finally {
      setIsSavingCustomer(false);
    }
  };
  
  const calculateCommission = (items: OrderItem[]): number => {
    return items.reduce((total, item) => {
        const product = products.find(p => p.id === item.productId);
        const commissionPercent = product?.affiliateCommissionPercent || 0;
        return total + (item.unitPrice * item.quantity * (commissionPercent / 100));
    }, 0);
  };
  
  const handleSave = async (e: React.FormEvent) => { 
	    e.preventDefault();
      setIsSaving(true);
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
    
      try {
	      if (editingId) { await onUpdate({ ...(orderToSave as Order) }); }
	      else { await onAdd({ ...orderToSave, userId: currentUser.id }); }
	      setIsModalOpen(false);
      } catch (error: any) {
        window.alert(error?.message || 'Não foi possível salvar o pedido.');
      } finally {
        setIsSaving(false);
      }
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-white/5 bg-rs-card p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Pedidos filtrados</div>
          <div className="mt-2 text-3xl font-bold text-slate-100">{orderMetrics.totalOrders}</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-rs-card p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Faturamento no filtro</div>
          <div className="mt-2 text-3xl font-bold text-rs-gold">R$ {orderMetrics.revenue.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-rs-card p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Pedidos com UTM</div>
          <div className="mt-2 text-3xl font-bold text-emerald-400">{orderMetrics.tracked}</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-rs-card p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Despachados / entregues</div>
          <div className="mt-2 text-3xl font-bold text-blue-400">{orderMetrics.shipped}</div>
        </div>
      </div>
      
      <DataTable
        {...table}
        columns={columns}
        data={table.paginatedData}
        onSort={table.requestSort}
        onSearch={table.setSearchTerm}
        onPageChange={{ next: table.nextPage, prev: table.prevPage, goTo: table.goToPage }}
        onItemsPerPageChange={table.handleItemsPerPageChange}
        searchPlaceholder="Buscar por cliente, e-mail, CPF/CNPJ, telefone, endereço, pedido, rastreio ou UTM..."
        toolbarContent={
          <>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | OrderStatus)} className="input-field min-w-[150px]">
              <option value="all">Todos os status</option>
              <option value="New">Novo</option>
              <option value="Packing">Em separação</option>
              <option value="Shipped">Enviado</option>
              <option value="Delivered">Entregue</option>
              <option value="Returned">Devolvido</option>
              <option value="Refunded">Reembolsado</option>
            </select>
            <select value={centerFilter} onChange={(e) => setCenterFilter(e.target.value)} className="input-field min-w-[170px]">
              <option value="all">Todos os CDs</option>
              {distributionCenters.map((center) => (
                <option key={center.id} value={center.id}>{center.name}</option>
              ))}
            </select>
            <select value={utmFilter} onChange={(e) => setUtmFilter(e.target.value)} className="input-field min-w-[170px]">
              <option value="all">Todas as origens UTM</option>
              {availableUtmSources.map((source) => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setCenterFilter('all');
                setUtmFilter('all');
                table.setSearchTerm('');
              }}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <RotateCcw size={14} />
              Limpar
            </button>
          </>
        }
      />
      
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
                        <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="text-xs uppercase tracking-[0.2em] text-rs-gold">Cliente</div>
                                <div className="inline-flex rounded-lg border border-white/10 bg-black/30 p-1">
                                    <button
                                        type="button"
                                        onClick={() => setCustomerMode('existing')}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-md ${customerMode === 'existing' ? 'bg-rs-gold text-black' : 'text-slate-400'}`}
                                    >
                                        Cliente existente
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCustomerMode('new')}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-md ${customerMode === 'new' ? 'bg-rs-gold text-black' : 'text-slate-400'}`}
                                    >
                                        Cadastrar cliente
                                    </button>
                                </div>
                            </div>

                            {customerMode === 'existing' ? (
                                <div>
                                    <label className="label-text">Selecionar cliente</label>
                                    <select
                                        value={formData.customerId}
                                        onChange={e => {
                                            const c = customers.find(cust => cust.id === e.target.value);
                                            setFormData({ ...formData, customerId: e.target.value, customerName: c?.name || '' });
                                        }}
                                        className="input-field"
                                        required
                                    >
                                        <option value="">Selecione...</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="label-text">Nome completo</label>
                                            <input type="text" value={customerDraft.name} onChange={e => handleCustomerDraftChange('name', e.target.value)} className="input-field" />
                                        </div>
                                        <div>
                                            <label className="label-text">CPF/CNPJ</label>
                                            <input type="text" value={customerDraft.document || ''} onChange={e => handleCustomerDraftChange('document', e.target.value)} className="input-field" />
                                        </div>
                                        <div>
                                            <label className="label-text">Telefone</label>
                                            <input type="text" value={customerDraft.phone} onChange={e => handleCustomerDraftChange('phone', e.target.value)} className="input-field" />
                                        </div>
                                        <div>
                                            <label className="label-text">E-mail</label>
                                            <input type="email" value={customerDraft.email || ''} onChange={e => handleCustomerDraftChange('email', e.target.value)} className="input-field" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="label-text">CEP</label>
                                            <input type="text" value={customerDraft.address.zipCode} onChange={e => handleCustomerAddressChange('zipCode', e.target.value)} className="input-field" />
                                        </div>
                                        <div>
                                            <label className="label-text">Rua / Logradouro</label>
                                            <input type="text" value={customerDraft.address.street} onChange={e => handleCustomerAddressChange('street', e.target.value)} className="input-field" />
                                        </div>
                                        <div>
                                            <label className="label-text">Número</label>
                                            <input type="text" value={customerDraft.address.number} onChange={e => handleCustomerAddressChange('number', e.target.value)} className="input-field" />
                                        </div>
                                        <div>
                                            <label className="label-text">Complemento</label>
                                            <input type="text" value={customerDraft.address.complement || ''} onChange={e => handleCustomerAddressChange('complement', e.target.value)} className="input-field" />
                                        </div>
                                        <div>
                                            <label className="label-text">Bairro</label>
                                            <input type="text" value={customerDraft.address.neighborhood} onChange={e => handleCustomerAddressChange('neighborhood', e.target.value)} className="input-field" />
                                        </div>
                                        <div>
                                            <label className="label-text">Cidade</label>
                                            <input type="text" value={customerDraft.address.city} onChange={e => handleCustomerAddressChange('city', e.target.value)} className="input-field" />
                                        </div>
                                        <div>
                                            <label className="label-text">Estado</label>
                                            <input type="text" value={customerDraft.address.state} onChange={e => handleCustomerAddressChange('state', e.target.value)} className="input-field" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button type="button" onClick={() => void handleSaveInlineCustomer()} className="btn-secondary inline-flex items-center gap-2" disabled={isSavingCustomer}>
                                            <UserIcon size={14} />
                                            {isSavingCustomer ? 'Salvando cliente...' : 'Salvar cliente e usar neste pedido'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div><label className="label-text">Data do Pedido</label><input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="input-field"/></div>
                        <div>
                            <label className="label-text">Status</label>
                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as OrderStatus})} className="input-field">
                                <option value="New">Novo</option>
                                <option value="Packing">Em SeparaÃ§Ã£o</option>
                                <option value="Shipped">Enviado</option>
                                <option value="Delivered">Entregue</option>
                                <option value="Returned">Devolvido</option>
                                <option value="Refunded">Reembolsado</option>
                            </select>
                        </div>
                        {selectedCustomer ? (
                            <div className="rounded-xl border border-rs-goldDim/30 bg-black/20 p-4 space-y-3">
                                <div className="text-xs uppercase tracking-[0.2em] text-rs-gold">Resumo do cliente</div>
                                <div className="text-sm text-slate-100 font-semibold">{selectedCustomer.name}</div>
                                <div className="grid grid-cols-1 gap-2 text-xs text-slate-400">
                                    <div className="flex items-center gap-2"><Mail size={12} /> {selectedCustomer.email || 'Sem e-mail'}</div>
                                    <div className="flex items-center gap-2"><Phone size={12} /> {selectedCustomer.phone || 'Sem telefone'}</div>
                                    <div className="flex items-center gap-2"><IdCard size={12} /> {selectedCustomer.document || 'Sem CPF/CNPJ'}</div>
                                    <div className="flex items-start gap-2"><MapPin size={12} className="mt-0.5" /> <span>{selectedCustomerAddress || 'EndereÃ§o nÃ£o informado'}</span></div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                    <div className="space-y-4">
                        <div><label className="label-text">Canal de Venda</label><input type="text" value={formData.salesChannel} onChange={e => setFormData({...formData, salesChannel: e.target.value})} className="input-field"/></div>
                        <div><label className="label-text">Campanha (Opcional)</label><input type="text" value={formData.campaign} onChange={e => setFormData({...formData, campaign: e.target.value})} className="input-field"/></div>
                        <div><label className="label-text">Notas Internas</label><textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="input-field"/></div>
                    </div>
                </div>
            )}
            {false && activeTab === 'customer' && (
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
                          {selectedCustomer ? (
                            <div className="rounded-xl border border-rs-goldDim/30 bg-black/20 p-4 space-y-3">
                              <div className="text-xs uppercase tracking-[0.2em] text-rs-gold">Resumo do cliente</div>
                              <div className="text-sm text-slate-100 font-semibold">{selectedCustomer.name}</div>
                              <div className="grid grid-cols-1 gap-2 text-xs text-slate-400">
                                <div className="flex items-center gap-2"><Mail size={12} /> {selectedCustomer.email || 'Sem e-mail'}</div>
                                <div className="flex items-center gap-2"><Phone size={12} /> {selectedCustomer.phone || 'Sem telefone'}</div>
                                <div className="flex items-center gap-2"><IdCard size={12} /> {selectedCustomer.document || 'Sem CPF/CNPJ'}</div>
                                <div className="flex items-start gap-2"><MapPin size={12} className="mt-0.5" /> <span>{selectedCustomerAddress || 'Endereço não informado'}</span></div>
                              </div>
                            </div>
                          ) : null}
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
                      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-rs-gold mb-3">Destino & fulfillment</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400">
                          <div className="flex items-start gap-2">
                            <MapPin size={12} className="mt-0.5" />
                            <span>{selectedCustomerAddress || 'Endereço do cliente não informado'}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Warehouse size={12} className="mt-0.5" />
                            <span>{selectedCenter?.name || 'CD ainda não definido'}</span>
                          </div>
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
                               <div className="md:col-span-2"><label className="label-text">utm_term</label><input type="text" value={formData.utmTerm || ''} onChange={e => setFormData({...formData, utmTerm: e.target.value})} className="input-field"/></div>
                               <div className="md:col-span-2 rounded-lg border border-rs-goldDim/20 bg-rs-gold/5 p-3 text-xs text-slate-400">
                                 Preencha as UTMs para deixar o pedido rastreável por campanha, canal, criativo e palavra-chave.
                               </div>
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
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" disabled={isSaving}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar Pedido'}</button>
          </div>
        </div>
      </form>
      </ModalWrapper>

      {viewedOrder && (
        <OrderQuickDrawer
          order={viewedOrder}
          customer={viewedOrderCustomer || null}
          fulfillmentCenter={distributionCenters.find((center) => center.id === viewedOrder.fulfillmentCenterId) || null}
          onClose={() => setViewingOrderId(null)}
          onSave={onUpdate}
        />
      )}

      <style>{`.label-text{display:block;font-size:0.75rem;color:#94a3b8;margin-bottom:0.25rem}.label-text-header{font-size:0.875rem;font-weight:700;color:#d1d5db;margin-bottom:0.75rem;display:flex;align-items:center;gap:0.5rem}.input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e2e8f0;outline:none}.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem;}.btn-secondary{border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem;}`}</style>
    </div>
  );
};

interface OrderQuickDrawerProps {
  order: Order;
  customer: Customer | null;
  fulfillmentCenter: DistributionCenter | null;
  onClose: () => void;
  onSave: (order: Order) => void | Promise<void>;
}

const OrderQuickDrawer: React.FC<OrderQuickDrawerProps> = ({ order, customer, fulfillmentCenter, onClose, onSave }) => {
  const [draftOrder, setDraftOrder] = useState<Order>(order);
  const [isSavingQuickEdit, setIsSavingQuickEdit] = useState(false);

  useEffect(() => {
    setDraftOrder(order);
  }, [order]);

  const timeline = [
    { key: 'created', label: 'Pedido criado', date: draftOrder.date, icon: <CalendarDays size={14} /> },
    { key: 'shipping', label: 'Despacho', date: draftOrder.shippingDate, icon: <Truck size={14} /> },
    { key: 'estimated', label: 'Entrega prevista', date: draftOrder.estimatedDeliveryDate, icon: <Clock3 size={14} /> },
    { key: 'delivered', label: 'Entrega confirmada', date: draftOrder.actualDeliveryDate, icon: <ShieldCheck size={14} /> },
  ].filter((item) => item.date);

  const grandTotal = draftOrder.itemsTotal + draftOrder.shippingCharged - draftOrder.discountTotal;
  const customerAddress = customer?.address
    ? [
        customer.address.street,
        customer.address.number,
        customer.address.complement,
        customer.address.neighborhood,
        customer.address.city,
        customer.address.state,
        customer.address.zipCode,
      ].filter(Boolean).join(', ')
    : (draftOrder.shippingAddress || '');

  const handleQuickSave = async () => {
    setIsSavingQuickEdit(true);
    try {
      await onSave(draftOrder);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
      window.alert('Não foi possível salvar as alterações rápidas do pedido.');
    } finally {
      setIsSavingQuickEdit(false);
    }
  };

  return (
    <ModalWrapper isOpen={true} onClose={onClose} title={`Pedido #${draftOrder.id.slice(0, 8)}`} size="4xl">
      <div className="flex flex-col h-full overflow-hidden">
        <div className="grid grid-cols-1 gap-4 border-b border-white/10 p-6 md:grid-cols-4">
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Cliente</div>
            <div className="mt-2 font-semibold text-slate-100">{draftOrder.customerName}</div>
            <div className="mt-1 text-xs text-slate-400">{customer?.email || draftOrder.customerEmail || 'Sem e-mail'}</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Total</div>
            <div className="mt-2 text-2xl font-bold text-rs-gold">R$ {grandTotal.toFixed(2)}</div>
            <div className="mt-1 text-xs text-slate-400">Frete cobrado: R$ {draftOrder.shippingCharged.toFixed(2)}</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</div>
            <div className="mt-2 inline-flex rounded-full bg-rs-gold/10 px-3 py-1 text-xs font-bold uppercase text-rs-gold">{draftOrder.status}</div>
            <div className="mt-2 text-xs text-slate-400">Rastreio: {draftOrder.trackingCode || 'Não informado'}</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">CD & Origem</div>
            <div className="mt-2 text-sm font-semibold text-slate-100">{fulfillmentCenter?.name || 'CD não atribuído'}</div>
            <div className="mt-1 text-xs text-slate-400">{draftOrder.salesChannel || 'Canal não informado'}</div>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section className="rounded-xl border border-rs-gold/15 bg-black/20 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                  <Edit2 size={16} className="text-rs-gold" />
                  Edição rápida do pedido
                </div>
                <button
                  type="button"
                  onClick={handleQuickSave}
                  disabled={isSavingQuickEdit}
                  className="inline-flex items-center gap-2 rounded-lg bg-rs-gold px-4 py-2 text-sm font-bold text-black transition hover:bg-rs-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={15} />
                  {isSavingQuickEdit ? 'Salvando...' : 'Salvar ajustes'}
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="label-text">Status do pedido</label>
                  <select
                    value={draftOrder.status}
                    onChange={(e) => setDraftOrder((prev) => ({ ...prev, status: e.target.value as OrderStatus }))}
                    className="input-field"
                  >
                    <option value="New">Novo</option>
                    <option value="Packing">Separando</option>
                    <option value="Shipped">Enviado</option>
                    <option value="Delivered">Entregue</option>
                    <option value="Returned">Devolvido</option>
                    <option value="Refunded">Reembolsado</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Código de rastreio</label>
                  <input
                    type="text"
                    value={draftOrder.trackingCode || ''}
                    onChange={(e) => setDraftOrder((prev) => ({ ...prev, trackingCode: e.target.value }))}
                    className="input-field font-mono"
                    placeholder="BR123456789"
                  />
                </div>
                <div>
                  <label className="label-text">Data do despacho</label>
                  <input
                    type="date"
                    value={draftOrder.shippingDate || ''}
                    onChange={(e) => setDraftOrder((prev) => ({ ...prev, shippingDate: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-text">Entrega prevista</label>
                  <input
                    type="date"
                    value={draftOrder.estimatedDeliveryDate || ''}
                    onChange={(e) => setDraftOrder((prev) => ({ ...prev, estimatedDeliveryDate: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label-text">Entrega confirmada</label>
                  <input
                    type="date"
                    value={draftOrder.actualDeliveryDate || ''}
                    onChange={(e) => setDraftOrder((prev) => ({ ...prev, actualDeliveryDate: e.target.value }))}
                    className="input-field"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-white/5 bg-black/20 p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-100">
                <Package size={16} className="text-rs-gold" />
                Itens do pedido
              </div>
              <div className="space-y-3">
                {draftOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 p-3">
                    <div>
                      <div className="font-medium text-slate-100">{item.productName}</div>
                      <div className="text-xs text-slate-400">Qtd. {item.quantity} • SKU/ID: {item.productId}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-rs-gold">R$ {(item.unitPrice * item.quantity).toFixed(2)}</div>
                      <div className="text-xs text-slate-500">Custo: R$ {item.unitCost.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-white/5 bg-black/20 p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-100">
                <MapPin size={16} className="text-rs-gold" />
                Cliente e entrega
              </div>
              <div className="grid grid-cols-1 gap-3 text-sm text-slate-300 md:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Documento</div>
                  <div className="mt-1">{customer?.document || draftOrder.customerDocument || 'Não informado'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Telefone</div>
                  <div className="mt-1">{customer?.phone || draftOrder.customerPhone || 'Não informado'}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Endereço</div>
                  <div className="mt-1">{customerAddress || 'Endereço não informado'}</div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-xl border border-white/5 bg-black/20 p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-100">
                <Clock3 size={16} className="text-rs-gold" />
                Timeline operacional
              </div>
              <div className="space-y-4">
                {timeline.length > 0 ? timeline.map((event) => (
                  <div key={event.key} className="flex gap-3">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-rs-gold/20 bg-rs-gold/10 text-rs-gold">
                      {event.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-100">{event.label}</div>
                      <div className="text-xs text-slate-400">{event.date}</div>
                    </div>
                  </div>
                )) : (
                  <div className="text-sm text-slate-500">Sem eventos operacionais registrados além da criação do pedido.</div>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-white/5 bg-black/20 p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-100">
                <Target size={16} className="text-rs-gold" />
                Marketing e UTM
              </div>
              <div className="grid grid-cols-1 gap-3 text-sm text-slate-300">
                <div><span className="text-slate-500">Campanha:</span> {draftOrder.campaign || 'Não informada'}</div>
                <div><span className="text-slate-500">utm_source:</span> {draftOrder.utmSource || '-'}</div>
                <div><span className="text-slate-500">utm_medium:</span> {draftOrder.utmMedium || '-'}</div>
                <div><span className="text-slate-500">utm_campaign:</span> {draftOrder.utmCampaign || '-'}</div>
                <div><span className="text-slate-500">utm_content:</span> {draftOrder.utmContent || '-'}</div>
                <div><span className="text-slate-500">utm_term:</span> {draftOrder.utmTerm || '-'}</div>
              </div>
            </section>

            <section className="rounded-xl border border-white/5 bg-black/20 p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-100">
                <BadgeDollarSign size={16} className="text-rs-gold" />
                Financeiro
              </div>
              <div className="grid grid-cols-1 gap-3 text-sm text-slate-300">
                <div><span className="text-slate-500">Subtotal:</span> R$ {draftOrder.itemsTotal.toFixed(2)}</div>
                <div><span className="text-slate-500">Desconto:</span> R$ {draftOrder.discountTotal.toFixed(2)}</div>
                <div><span className="text-slate-500">Frete:</span> R$ {draftOrder.shippingCharged.toFixed(2)}</div>
                <div><span className="text-slate-500">Taxa gateway:</span> R$ {draftOrder.paymentFee.toFixed(2)}</div>
                <div><span className="text-slate-500">Taxa plataforma:</span> R$ {draftOrder.platformFee.toFixed(2)}</div>
                <div><span className="text-slate-500">Outras despesas:</span> R$ {draftOrder.otherExpenses.toFixed(2)}</div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
