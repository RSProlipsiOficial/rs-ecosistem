
import React, { useState, useMemo } from 'react';
import { Customer, User, Order, Lead } from '../types';
import { Plus, Edit2, Trash2, X, Users, MapPin, Phone, Mail, Download, Eye, FileText, ShoppingCart, TrendingDown, Clipboard, Save } from 'lucide-react';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';
import { ModalWrapper } from './ModalWrapper';

interface CustomerManagerProps {
  customers: Customer[];
  orders: Order[]; // Added orders to props
  leads: Lead[];   // Added leads to props
  onAdd: (c: Omit<Customer, 'id'>) => void;
  onUpdate: (c: Customer) => void;
  onDelete: (id: string) => void;
  currentUser: User;
  users: User[];
}

const EMPTY_CUSTOMER: Omit<Customer, 'id'> = {
  name: '', phone: '', email: '', document: '',
  address: { street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zipCode: '' },
  userId: '',
  notes: ''
};

export const CustomerManager: React.FC<CustomerManagerProps> = ({ customers, orders, leads, onAdd, onUpdate, onDelete, currentUser, users }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Customer, 'id'>>(EMPTY_CUSTOMER);
  
  // State for the 360 View Modal
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
            <button onClick={() => onDelete(c.id)} className="p-2 text-slate-400 hover:text-red-400"><Trash2 size={16}/></button>
        </div>
      )
    }
  ];

  const handleOpenModal = (c?: Customer) => {
    if (c) {
      setEditingId(c.id);
      // Ensure notes is initialized
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
      onUpdate({ ...formData, id: editingId, userId: formData.userId });
    } else {
      onAdd({ ...formData, userId: currentUser.id });
    }
    setIsModalOpen(false);
  };
  
  const handleAddressChange = (field: keyof Customer['address'], value: string) => {
      setFormData({ ...formData, address: { ...formData.address, [field]: value } });
  };
  
  const handleExport = () => { /* Export logic */ };

  // --- 360 VIEW RENDERER ---
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
      
      {/* ADD/EDIT MODAL */}
      <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Cliente' : 'Novo Cliente'}>
        <form onSubmit={handleSave} className="flex flex-col h-full">
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="label-text">Nome Completo</label><input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" /></div>
                    <div><label className="label-text">CPF/CNPJ</label><input type="text" value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} className="input-field" /></div>
                    <div><label className="label-text">Telefone</label><input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-field" /></div>
                    <div><label className="label-text">E-mail</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-field" /></div>
                </div>
                <div className="border-t border-white/10 pt-4">
                    <h4 className="font-bold text-slate-300 mb-3">Endereço</h4>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1"><label className="label-text">CEP</label><input type="text" value={formData.address.zipCode} onChange={e => handleAddressChange('zipCode', e.target.value)} className="input-field" /></div>
                        <div className="col-span-2"><label className="label-text">Rua</label><input type="text" value={formData.address.street} onChange={e => handleAddressChange('street', e.target.value)} className="input-field" /></div>
                        <div><label className="label-text">Número</label><input type="text" value={formData.address.number} onChange={e => handleAddressChange('number', e.target.value)} className="input-field" /></div>
                        <div><label className="label-text">Complemento</label><input type="text" value={formData.address.complement} onChange={e => handleAddressChange('complement', e.target.value)} className="input-field" /></div>
                        <div><label className="label-text">Bairro</label><input type="text" value={formData.address.neighborhood} onChange={e => handleAddressChange('neighborhood', e.target.value)} className="input-field" /></div>
                        <div><label className="label-text">Cidade</label><input type="text" value={formData.address.city} onChange={e => handleAddressChange('city', e.target.value)} className="input-field" /></div>
                        <div><label className="label-text">Estado</label><input type="text" value={formData.address.state} onChange={e => handleAddressChange('state', e.target.value)} className="input-field" /></div>
                    </div>
                </div>
                <div>
                     <label className="label-text">Observações Internas</label>
                     <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="input-field resize-none"></textarea>
                </div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Salvar</button>
            </div>
        </form>
      </ModalWrapper>

      {/* 360 VIEW MODAL */}
      {viewingCustomer && (
          <CustomerDetailModal 
            customer={viewingCustomer} 
            orders={orders} 
            leads={leads}
            onClose={() => setViewingCustomerId(null)} 
            onUpdate={onUpdate}
          />
      )}

      <style>{`.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem;}.btn-secondary{background-color:transparent;border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem;}.label-text{display:block;font-size:0.75rem;color:#94a3b8;margin-bottom:0.25rem}.input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e2e8f0;outline:none}`}</style>
    </div>
  );
};

// --- CUSTOMER DETAIL COMPONENT ---

const CustomerDetailModal = ({ customer, orders, leads, onClose, onUpdate }: { customer: Customer, orders: Order[], leads: Lead[], onClose: () => void, onUpdate: (c: Customer) => void }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'returns' | 'leads'>('overview');
    const [notes, setNotes] = useState(customer.notes || '');

    // Derived Data
    const customerOrders = useMemo(() => orders.filter(o => o.customerId === customer.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [orders, customer.id]);
    
    // Fuzzy matching for leads based on phone or email
    const customerLeads = useMemo(() => leads.filter(l => {
        const phoneMatch = customer.phone && l.phone && l.phone.replace(/\D/g, '') === customer.phone.replace(/\D/g, '');
        // const emailMatch = customer.email && l.email && l.email.toLowerCase() === customer.email.toLowerCase(); // Lead doesn't have email in interface, assume future
        const nameMatch = l.name.toLowerCase() === customer.name.toLowerCase();
        return phoneMatch || nameMatch;
    }), [leads, customer]);

    const postSaleEvents = useMemo(() => customerOrders.flatMap(o => (o.postSaleEvents || []).map(e => ({...e, orderDate: o.date}))), [customerOrders]);

    // KPIs
    const ltv = customerOrders.reduce((acc, o) => acc + o.itemsTotal + o.shippingCharged - o.discountTotal, 0);
    const avgTicket = customerOrders.length > 0 ? ltv / customerOrders.length : 0;
    const refundedTotal = postSaleEvents.reduce((acc, e) => acc + e.amount, 0);

    const handleSaveNotes = () => {
        onUpdate({ ...customer, notes });
        // Optional: Show toast or feedback
    };

    return (
        <ModalWrapper isOpen={true} onClose={onClose} title="Visão 360° do Cliente" size="4xl">
            <div className="flex flex-col h-full overflow-hidden">
                {/* Header Stats */}
                <div className="p-6 bg-black/20 border-b border-white/5 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Cliente</div>
                        <div className="font-bold text-xl text-slate-100">{customer.name}</div>
                        <div className="text-xs text-slate-400">{customer.document || 'Sem CPF/CNPJ'}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">LTV (Total Gasto)</div>
                        <div className="font-bold text-xl text-emerald-400">R$ {ltv.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Ticket Médio</div>
                        <div className="font-bold text-xl text-rs-gold">R$ {avgTicket.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Pedidos</div>
                        <div className="font-bold text-xl text-blue-400">{customerOrders.length}</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 border-b border-white/10 flex gap-2 overflow-x-auto">
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<FileText size={16}/>} label="Visão Geral" />
                    <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ShoppingCart size={16}/>} label={`Pedidos (${customerOrders.length})`} />
                    <TabButton active={activeTab === 'returns'} onClick={() => setActiveTab('returns')} icon={<TrendingDown size={16}/>} label={`Devoluções (${postSaleEvents.length})`} />
                    <TabButton active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} icon={<Users size={16}/>} label={`Leads (${customerLeads.length})`} />
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-rs-card">
                    
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-bold text-slate-300 flex items-center gap-2 mb-3"><Phone size={16} /> Contato</h4>
                                    <div className="bg-black/20 p-4 rounded-lg border border-white/5 space-y-2">
                                        <div className="text-sm"><span className="text-slate-500 block text-xs">Telefone</span>{customer.phone}</div>
                                        <div className="text-sm"><span className="text-slate-500 block text-xs">E-mail</span>{customer.email || 'Não cadastrado'}</div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-300 flex items-center gap-2 mb-3"><MapPin size={16} /> Endereço Principal</h4>
                                    <div className="bg-black/20 p-4 rounded-lg border border-white/5 text-sm leading-relaxed text-slate-300">
                                        {customer.address.street}, {customer.address.number} {customer.address.complement}<br/>
                                        {customer.address.neighborhood}<br/>
                                        {customer.address.city} - {customer.address.state}<br/>
                                        CEP: {customer.address.zipCode}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col h-full">
                                <h4 className="font-bold text-slate-300 flex items-center gap-2 mb-3"><Clipboard size={16} /> Notas Internas</h4>
                                <div className="flex-1 flex flex-col gap-2">
                                    <textarea 
                                        className="w-full h-full bg-black/20 border border-white/10 rounded-lg p-4 text-sm text-slate-200 resize-none focus:border-rs-gold outline-none"
                                        placeholder="Adicione observações importantes sobre este cliente (ex: Trocou de endereço, cliente VIP, recorrente...)"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    ></textarea>
                                    <button onClick={handleSaveNotes} className="self-end bg-rs-gold text-rs-black font-bold px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-yellow-500">
                                        <Save size={16}/> Salvar Nota
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="space-y-4">
                            {customerOrders.length === 0 ? (
                                <p className="text-slate-500 text-center py-10">Nenhum pedido encontrado para este cliente.</p>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-white/5 text-slate-400 text-xs uppercase">
                                        <tr>
                                            <th className="p-3">Data/ID</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3 text-right">Total</th>
                                            <th className="p-3">Itens</th>
                                            <th className="p-3">Canal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-slate-300">
                                        {customerOrders.map(o => (
                                            <tr key={o.id} className="hover:bg-white/5">
                                                <td className="p-3">
                                                    <div className="font-mono text-rs-gold text-xs">#{o.id.slice(0,8)}</div>
                                                    <div className="text-xs text-slate-500">{o.date.split('-').reverse().join('/')}</div>
                                                </td>
                                                <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-white/10">{o.status}</span></td>
                                                <td className="p-3 text-right font-medium">R$ {(o.itemsTotal + o.shippingCharged).toFixed(2)}</td>
                                                <td className="p-3 text-xs">{o.items.length} itens ({o.items[0]?.productName}...)</td>
                                                <td className="p-3 text-xs text-slate-400">{o.salesChannel}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {activeTab === 'returns' && (
                        <div>
                             <div className="mb-4 bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex justify-between items-center">
                                 <span className="text-red-300 font-bold flex items-center gap-2"><TrendingDown size={18}/> Total Reembolsado/Perdido</span>
                                 <span className="text-xl font-bold text-red-400">R$ {refundedTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                             </div>
                             {postSaleEvents.length === 0 ? (
                                <p className="text-slate-500 text-center py-10">Nenhum histórico de devolução ou reembolso.</p>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-white/5 text-slate-400 text-xs uppercase">
                                        <tr>
                                            <th className="p-3">Data</th>
                                            <th className="p-3">Pedido Origem</th>
                                            <th className="p-3">Tipo</th>
                                            <th className="p-3">Motivo</th>
                                            <th className="p-3 text-right">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-slate-300">
                                        {postSaleEvents.map((e, idx) => (
                                            <tr key={idx} className="hover:bg-white/5">
                                                <td className="p-3 text-slate-400 text-xs">{e.date.split('-').reverse().join('/')}</td>
                                                <td className="p-3 font-mono text-xs">#{e.orderId.slice(0,8)}</td>
                                                <td className="p-3"><span className="text-red-400 bg-red-900/20 px-2 py-0.5 rounded text-xs">{e.type}</span></td>
                                                <td className="p-3 text-xs italic">{e.reason}</td>
                                                <td className="p-3 text-right text-red-400 font-bold">- R$ {e.amount.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {activeTab === 'leads' && (
                        <div className="space-y-4">
                            <p className="text-xs text-slate-500 italic bg-blue-500/10 p-2 rounded border border-blue-500/20">
                                Mostrando leads vinculados por telefone ou nome similar.
                            </p>
                            {customerLeads.length === 0 ? (
                                <p className="text-slate-500 text-center py-10">Nenhum lead de marketing encontrado para este perfil.</p>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-white/5 text-slate-400 text-xs uppercase">
                                        <tr>
                                            <th className="p-3">Data Cadastro</th>
                                            <th className="p-3">Origem (Source)</th>
                                            <th className="p-3">Status Lead</th>
                                            <th className="p-3">Local</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-slate-300">
                                        {customerLeads.map(l => (
                                            <tr key={l.id} className="hover:bg-white/5">
                                                <td className="p-3 text-xs">{l.date.split('-').reverse().join('/')}</td>
                                                <td className="p-3"><span className="bg-slate-700 px-2 py-0.5 rounded text-xs">{l.source}</span></td>
                                                <td className="p-3 text-xs">{l.status}</td>
                                                <td className="p-3 text-xs text-slate-400">{l.city}/{l.state}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </ModalWrapper>
    );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors whitespace-nowrap
        ${active ? 'border-rs-gold text-rs-gold' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'}`}
    >
        {icon} {label}
    </button>
);
