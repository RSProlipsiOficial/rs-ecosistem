import React, { useState, useMemo } from 'react';
import { Customer, User, Order, Lead, Ticket, RMA } from '../types';
import { Plus, Edit2, Trash2, X, Users, MapPin, Phone, Mail, Download, Eye, FileText, ShoppingCart, TrendingDown, Clipboard, Save, Headphones, RefreshCw } from 'lucide-react';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';
import { ModalWrapper } from './ModalWrapper';
import { TabButton } from './TabButton';

interface CustomerManagerProps {
  customers: Customer[];
  orders: Order[];
  leads: Lead[];
  tickets: Ticket[];
  rmas: RMA[];
  onAdd: (c: Omit<Customer, 'id'>) => void;
  onUpdate: (c: Customer) => void;
  onDelete: (id: string) => void;
  currentUser: User;
  users: User[];
}

const EMPTY_CUSTOMER: Omit<Customer, 'id' | 'userId'> = {
  name: '', phone: '', email: '', document: '',
  address: { street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zipCode: '' },
  notes: ''
};

export const CustomerManager: React.FC<CustomerManagerProps> = ({ customers, orders, leads, tickets, rmas, onAdd, onUpdate, onDelete, currentUser, users }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Customer, 'id'>>(EMPTY_CUSTOMER);
  
  const [viewingCustomerId, setViewingCustomerId] = useState<string | null>(null);

  const table = useDataTable({ initialData: customers, searchKeys: ['name', 'email', 'phone', 'document'] });

  const columns: Column<Customer>[] = [
    { 
      header: 'Nome', accessor: 'name', sortable: true, 
      render: (c) => (
        <div>
          <span className="font-bold text-slate-200">{c.name}</span>
          <div className="text-xs text-slate-500">{c.document || 'Sem Documento'}</div>
        </div>
      )
    },
    ...(currentUser.role === 'Admin' ? [{
        header: 'Logista', accessor: 'userId', sortable: true,
        render: (c: Customer) => <span className="text-xs text-slate-400">{users.find(u => u.id === c.userId)?.name || 'N/A'}</span>
    } as Column<Customer>] : []),
    {
      header: 'Contato', accessor: 'phone', sortable: false,
      render: (c) => (
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1.5"><Phone size={12}/> {c.phone}</div>
          <div className="flex items-center gap-1.5"><Mail size={12}/> {c.email || 'N/A'}</div>
        </div>
      )
    },
    {
      header: 'Localização', accessor: 'address.city', sortable: true,
      render: (c) => (
         <div className="text-xs flex items-center gap-1.5 text-slate-400">
            <MapPin size={12}/> {c.address.city}, {c.address.state}
         </div>
      )
    },
    {
      header: 'Ações', accessor: 'actions', headerClassName: 'text-center', cellClassName: 'text-center',
      render: (c) => (
        <div className="flex justify-center gap-2">
            <button onClick={() => setViewingCustomerId(c.id)} className="p-2 text-slate-400 hover:text-rs-gold" title="Visão 360°"><Eye size={16}/></button>
            <button onClick={() => handleOpenModal(c)} className="p-2 text-slate-400 hover:text-blue-400"><Edit2 size={16}/></button>
            {currentUser.role === 'Admin' && <button onClick={() => onDelete(c.id)} className="p-2 text-slate-400 hover:text-red-400"><Trash2 size={16}/></button>}
        </div>
      )
    }
  ];

  const handleOpenModal = (c?: Customer) => {
    if (c) {
      setEditingId(c.id);
      setFormData({ ...c, notes: c.notes || '' });
    } else {
      setEditingId(null);
      setFormData(EMPTY_CUSTOMER);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate({ ...formData, id: editingId, userId: (formData as Customer).userId });
    } else {
      onAdd({ ...formData, userId: currentUser.id });
    }
    setIsModalOpen(false);
  };
  
  const handleAddressChange = (field: keyof Customer['address'], value: string) => {
      setFormData({ ...formData, address: { ...formData.address, [field]: value } });
  };
  
  const handleExport = () => { /* Export logic */ };

  const viewingCustomer = customers.find(c => c.id === viewingCustomerId);
  
  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-rs-gold">Clientes (Compradores)</h2>
          <p className="text-sm text-slate-400">Base de clientes com histórico de compra</p>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={handleExport} className="btn-secondary"><Download size={18} /></button>
           <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2"><Plus size={18} /> Novo Cliente</button>
        </div>
      </div>

      <DataTable {...table} columns={columns} data={table.paginatedData} onSort={table.requestSort} onSearch={table.setSearchTerm} onPageChange={{next: table.nextPage, prev: table.prevPage, goTo: table.goToPage}} onItemsPerPageChange={table.handleItemsPerPageChange} />
      
      <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Cliente' : 'Novo Cliente'}>
        <form onSubmit={handleSave} className="flex flex-col h-full">
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="label-text">Nome</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" required /></div>
                    <div><label className="label-text">Documento (CPF/CNPJ)</label><input type="text" value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} className="input-field" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="label-text">Telefone</label><input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-field" required /></div>
                    <div><label className="label-text">E-mail</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-field" /></div>
                </div>
                <div className="border-t border-white/10 pt-4">
                    <h3 className="font-bold text-slate-300 mb-2">Endereço</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1"><label className="label-text">CEP</label><input type="text" value={formData.address.zipCode} onChange={e => handleAddressChange('zipCode', e.target.value)} className="input-field" /></div>
                        <div className="col-span-2"><label className="label-text">Rua</label><input type="text" value={formData.address.street} onChange={e => handleAddressChange('street', e.target.value)} className="input-field" /></div>
                    </div>
                     <div className="grid grid-cols-3 gap-4 mt-4">
                        <div><label className="label-text">Número</label><input type="text" value={formData.address.number} onChange={e => handleAddressChange('number', e.target.value)} className="input-field" /></div>
                        <div><label className="label-text">Bairro</label><input type="text" value={formData.address.neighborhood} onChange={e => handleAddressChange('neighborhood', e.target.value)} className="input-field" /></div>
                        <div><label className="label-text">Cidade</label><input type="text" value={formData.address.city} onChange={e => handleAddressChange('city', e.target.value)} className="input-field" /></div>
                    </div>
                </div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Salvar</button>
            </div>
        </form>
      </ModalWrapper>

      {viewingCustomer && (
          <CustomerDetailModal 
            customer={viewingCustomer} 
            orders={orders} 
            leads={leads}
            tickets={tickets}
            rmas={rmas}
            onClose={() => setViewingCustomerId(null)} 
            onUpdate={onUpdate}
          />
      )}

      <style>{`.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem;}.btn-secondary{background-color:transparent;border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem;}.label-text{display:block;font-size:0.75rem;color:#94a3b8;margin-bottom:0.25rem}.input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e2e8f0;outline:none}`}</style>
    </div>
  );
};

interface CustomerDetailModalProps {
  customer: Customer;
  orders: Order[];
  leads: Lead[];
  tickets: Ticket[];
  rmas: RMA[];
  onClose: () => void;
  onUpdate: (c: Customer) => void;
}

interface EventIconProps {
  type: string;
}

interface OrderTimelineCardProps {
  order: Order;
}

interface TicketTimelineCardProps {
  ticket: Ticket;
}

interface RmaTimelineCardProps {
  rma: RMA;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ customer, orders, leads, tickets, rmas, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'timeline' | 'overview'>('timeline');
    const [notes, setNotes] = useState(customer.notes || '');

    const timelineEvents = useMemo(() => {
        const customerOrders = orders.filter(o => o.customerId === customer.id).map(o => ({ ...o, type: 'order', date: o.date }));
        const customerTickets = tickets.filter(t => t.customerId === customer.id).map(t => ({ ...t, type: 'ticket', date: t.createdAt }));
        const customerRmas = rmas.filter(r => r.customerId === customer.id).map(r => ({ ...r, type: 'rma', date: r.createdAt }));

        return [...customerOrders, ...customerTickets, ...customerRmas].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [orders, tickets, rmas, customer.id]);

    const ltv = useMemo(() => orders.filter(o => o.customerId === customer.id).reduce((acc, o) => acc + o.itemsTotal + o.shippingCharged - o.discountTotal, 0), [orders, customer.id]);
    const avgTicket = ltv > 0 ? ltv / orders.filter(o => o.customerId === customer.id).length : 0;

    const handleSaveNotes = () => {
        onUpdate({ ...customer, notes });
    };

    return (
        <ModalWrapper isOpen={true} onClose={onClose} title="Visão 360° do Cliente" size="4xl">
            <div className="flex flex-col h-full overflow-hidden">
                <div className="p-6 bg-black/20 border-b border-white/5 grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* ... stats */}
                </div>

                <div className="px-6 border-b border-white/10 flex gap-2 overflow-x-auto">
                    <TabButton isActive={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} icon={<FileText size={16}/>} label="Linha do Tempo" />
                    <TabButton isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Users size={16}/>} label="Dados Cadastrais" />
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-rs-card">
                    {activeTab === 'timeline' && (
                        <div className="relative pl-6">
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/10"></div>
                            {timelineEvents.map((event, i) => (
                                <div key={i} className="relative mb-8">
                                    <div className="absolute -left-[37px] top-1 w-8 h-8 rounded-full bg-rs-card border-2 border-white/10 flex items-center justify-center">
                                        <EventIcon type={event.type} />
                                    </div>
                                    <div className="text-xs text-slate-500 mb-1">{new Date(event.date).toLocaleString('pt-BR')}</div>
                                    {event.type === 'order' && <OrderTimelineCard order={event as Order} />}
                                    {event.type === 'ticket' && <TicketTimelineCard ticket={event as Ticket} />}
                                    {event.type === 'rma' && <RmaTimelineCard rma={event as RMA} />}
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'overview' && ( <div> {/* ... overview content */} </div> )}
                </div>
            </div>
        </ModalWrapper>
    );
};

const EventIcon: React.FC<EventIconProps> = ({type}) => {
    switch(type) {
        case 'order': return <ShoppingCart size={16}/>;
        case 'ticket': return <Headphones size={16}/>;
        case 'rma': return <RefreshCw size={16}/>;
        default: return <FileText size={16}/>;
    }
};

const OrderTimelineCard: React.FC<OrderTimelineCardProps> = ({order}) => (
    <div className="bg-black/20 p-4 rounded-lg border border-white/5">
        <div className="font-bold">Pedido #{order.id.slice(0,8)}</div>
        <div className="text-sm">Total: R$ {(order.itemsTotal + order.shippingCharged).toFixed(2)}</div>
        <div className="text-xs">Status: {order.status}</div>
    </div>
);

const TicketTimelineCard: React.FC<TicketTimelineCardProps> = ({ticket}) => (
    <div className="bg-blue-900/10 p-4 rounded-lg border border-blue-500/20">
        <div className="font-bold text-blue-300">Ticket: {ticket.subject}</div>
        <div className="text-sm">Canal: {ticket.channel}</div>
        <div className="text-xs">Status: {ticket.status}</div>
    </div>
);

const RmaTimelineCard: React.FC<RmaTimelineCardProps> = ({rma}) => (
    <div className="bg-orange-900/10 p-4 rounded-lg border border-orange-500/20">
        <div className="font-bold text-orange-300">RMA: {rma.type} - {rma.reason}</div>
        <div className="text-sm">Status: {rma.status}</div>
    </div>
);