import React, { useMemo, useState } from 'react';
import {
  Download,
  Edit2,
  Eye,
  FileText,
  Headphones,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Save,
  ShoppingCart,
  Tag,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Customer, CustomerSegment, CustomerWithMetrics, Lead, Order, RMA, Ticket, User } from '../types';
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
  onAdd: (c: Omit<Customer, 'id'>) => void | Promise<Customer | void>;
  onUpdate: (c: Customer) => void | Promise<Customer | void>;
  onDelete: (id: string) => void | Promise<void>;
  currentUser: User;
  users: User[];
}

const EMPTY_CUSTOMER: Omit<Customer, 'id'> = {
  name: '',
  phone: '',
  email: '',
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
  consents: {
    transactional: true,
    marketing: false,
  },
};

const SEGMENT_LABELS: Record<CustomerSegment, string> = {
  VIPs: 'VIP',
  Campeões: 'Campeão',
  Leais: 'Leal',
  Potencial: 'Potencial',
  'Em Risco': 'Em risco',
  Hibernando: 'Hibernando',
  Novos: 'Novo',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const formatDate = (value?: string) => {
  if (!value) return 'Sem histórico';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sem histórico';
  return date.toLocaleDateString('pt-BR');
};

const getRecencyInDays = (value?: string) => {
  if (!value) return 9999;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 9999;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)));
};

const getCustomerSegment = (frequency: number, monetary: number, recency: number): CustomerSegment => {
  if (frequency >= 5 && monetary >= 2500 && recency <= 45) return 'VIPs';
  if (frequency >= 4 && recency <= 60) return 'Campeões';
  if (frequency >= 2 && recency <= 90) return 'Leais';
  if (frequency >= 1 && recency <= 60) return 'Potencial';
  if (frequency >= 1 && recency <= 180) return 'Em Risco';
  if (frequency >= 1) return 'Hibernando';
  return 'Novos';
};

interface CustomerMetricRecord extends CustomerWithMetrics {
  ownerName: string;
  lastOrderDate?: string;
  lastOrderStatus?: string;
  lastOrderId?: string;
  averageTicket: number;
  cityState: string;
}

export const CustomerManager: React.FC<CustomerManagerProps> = ({
  customers,
  orders,
  leads,
  tickets,
  rmas,
  onAdd,
  onUpdate,
  onDelete,
  currentUser,
  users,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Customer, 'id'>>(EMPTY_CUSTOMER);
  const [isSaving, setIsSaving] = useState(false);
  const [viewingCustomerId, setViewingCustomerId] = useState<string | null>(null);
  const [segmentFilter, setSegmentFilter] = useState<'all' | CustomerSegment>('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [consentFilter, setConsentFilter] = useState<'all' | 'marketing' | 'transactional' | 'withoutOrders'>('all');

  const enrichedCustomers = useMemo<CustomerMetricRecord[]>(() => {
    return customers.map((customer) => {
      const customerOrders = orders
        .filter((order) => order.customerId === customer.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const frequency = customerOrders.length;
      const monetary = customerOrders.reduce(
        (total, order) => total + order.itemsTotal + order.shippingCharged - order.discountTotal,
        0
      );
      const lastOrder = customerOrders[0];
      const recency = getRecencyInDays(lastOrder?.date);
      const segment = getCustomerSegment(frequency, monetary, recency);

      return {
        ...customer,
        recency,
        frequency,
        monetary,
        segment,
        ownerName: users.find((user) => user.id === customer.userId)?.name || 'N/A',
        lastOrderDate: lastOrder?.date,
        lastOrderStatus: lastOrder?.status,
        lastOrderId: lastOrder?.id,
        averageTicket: frequency > 0 ? monetary / frequency : 0,
        cityState: [customer.address.city, customer.address.state].filter(Boolean).join(' / ') || 'Sem localidade',
      };
    });
  }, [customers, orders, users]);

  const availableCities = useMemo(
    () =>
      Array.from(
        new Set(
          enrichedCustomers
            .map((customer) => customer.address.city?.trim())
            .filter((city): city is string => Boolean(city))
        )
      ).sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [enrichedCustomers]
  );

  const filteredCustomers = useMemo(() => {
    return enrichedCustomers.filter((customer) => {
      if (segmentFilter !== 'all' && customer.segment !== segmentFilter) return false;
      if (cityFilter !== 'all' && customer.address.city !== cityFilter) return false;
      if (consentFilter === 'marketing' && !customer.consents?.marketing) return false;
      if (consentFilter === 'transactional' && customer.consents?.transactional === false) return false;
      if (consentFilter === 'withoutOrders' && customer.frequency > 0) return false;
      return true;
    });
  }, [cityFilter, consentFilter, enrichedCustomers, segmentFilter]);

  const table = useDataTable({
    initialData: filteredCustomers,
    searchKeys: [
      'name',
      'email',
      'phone',
      'document',
      'address.street',
      'address.number',
      'address.neighborhood',
      'address.city',
      'address.state',
      'address.zipCode',
      'notes',
      'segment',
      'ownerName',
    ],
  });

  const summary = useMemo(() => {
    const totalRevenue = filteredCustomers.reduce((total, customer) => total + customer.monetary, 0);
    const totalOrders = filteredCustomers.reduce((total, customer) => total + customer.frequency, 0);
    const marketingOptIn = filteredCustomers.filter((customer) => customer.consents?.marketing).length;
    const activeBase = filteredCustomers.filter((customer) => customer.frequency > 0).length;

    return {
      totalCustomers: filteredCustomers.length,
      totalRevenue,
      totalOrders,
      marketingOptIn,
      activeBase,
    };
  }, [filteredCustomers]);

  const handleExport = () => {
    const header = [
      'Nome',
      'Documento',
      'Telefone',
      'E-mail',
      'Cidade',
      'Estado',
      'Pedidos',
      'LTV',
      'Ticket Medio',
      'Segmento',
      'Ultima Compra',
      'Marketing',
    ];

    const rows = filteredCustomers.map((customer) => [
      customer.name,
      customer.document || '',
      customer.phone || '',
      customer.email || '',
      customer.address.city || '',
      customer.address.state || '',
      String(customer.frequency),
      customer.monetary.toFixed(2),
      customer.averageTicket.toFixed(2),
      customer.segment,
      formatDate(customer.lastOrderDate),
      customer.consents?.marketing ? 'Sim' : 'Nao',
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(';'))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clientes-rs-drop-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<CustomerMetricRecord>[] = [
    {
      header: 'Cliente',
      accessor: 'name',
      sortable: true,
      render: (customer) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-100">{customer.name}</span>
            <SegmentBadge segment={customer.segment} />
          </div>
          <div className="text-xs text-slate-500">{customer.document || 'Sem documento'}</div>
        </div>
      ),
    },
    ...(currentUser.role === 'Admin'
      ? [
          {
            header: 'Logista',
            accessor: 'ownerName',
            sortable: true,
            render: (customer: CustomerMetricRecord) => <span className="text-xs text-slate-300">{customer.ownerName}</span>,
          } as Column<CustomerMetricRecord>,
        ]
      : []),
    {
      header: 'Contato',
      accessor: 'email',
      sortable: true,
      render: (customer) => (
        <div className="space-y-1 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <Phone size={12} className="text-slate-500" />
            <span>{customer.phone || 'Sem telefone'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail size={12} className="text-slate-500" />
            <span>{customer.email || 'Sem e-mail'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Localidade',
      accessor: 'cityState',
      sortable: true,
      render: (customer) => (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <MapPin size={12} className="text-slate-500" />
            <span>{customer.cityState}</span>
          </div>
          <div className="text-slate-500">{customer.address.neighborhood || 'Sem bairro'}</div>
        </div>
      ),
    },
    {
      header: 'Relacionamento',
      accessor: 'frequency',
      sortable: true,
      render: (customer) => (
        <div className="space-y-1 text-xs">
          <div className="font-semibold text-slate-100">{customer.frequency} pedido(s)</div>
          <div className="text-slate-400">Última compra: {formatDate(customer.lastOrderDate)}</div>
          <div className="text-slate-500">Ticket médio: {formatCurrency(customer.averageTicket)}</div>
        </div>
      ),
    },
    {
      header: 'LTV',
      accessor: 'monetary',
      sortable: true,
      render: (customer) => (
        <div className="space-y-1 text-xs">
          <div className="font-semibold text-rs-gold">{formatCurrency(customer.monetary)}</div>
          <div className="text-slate-400">Recência: {customer.recency >= 9999 ? 'Sem compras' : `${customer.recency} dia(s)`}</div>
          <div className="text-slate-500">
            Consentimento: {customer.consents?.marketing ? 'Marketing ativo' : 'Só transacional'}
          </div>
        </div>
      ),
    },
    {
      header: 'Ações',
      accessor: 'actions',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: (customer) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setViewingCustomerId(customer.id)}
            className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-rs-goldDim/50 hover:text-rs-gold"
            title="Visão 360°"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleOpenModal(customer)}
            className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-blue-400/50 hover:text-blue-300"
            title="Editar cliente"
          >
            <Edit2 size={16} />
          </button>
          {currentUser.role === 'Admin' ? (
            <button
              onClick={() => void handleDelete(customer)}
              className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-red-400/50 hover:text-red-300"
              title="Excluir cliente"
            >
              <Trash2 size={16} />
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  const toolbarContent = (
    <>
      <select
        value={segmentFilter}
        onChange={(event) => setSegmentFilter(event.target.value as 'all' | CustomerSegment)}
        className="select-filter"
      >
        <option value="all">Todos os segmentos</option>
        {Object.entries(SEGMENT_LABELS).map(([segment, label]) => (
          <option key={segment} value={segment}>
            {label}
          </option>
        ))}
      </select>
      <select value={cityFilter} onChange={(event) => setCityFilter(event.target.value)} className="select-filter">
        <option value="all">Todas as cidades</option>
        {availableCities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
      <select
        value={consentFilter}
        onChange={(event) => setConsentFilter(event.target.value as 'all' | 'marketing' | 'transactional' | 'withoutOrders')}
        className="select-filter"
      >
        <option value="all">Todos os perfis</option>
        <option value="marketing">Opt-in marketing</option>
        <option value="transactional">Somente transacional</option>
        <option value="withoutOrders">Sem pedidos</option>
      </select>
      <button type="button" onClick={handleExport} className="btn-secondary inline-flex items-center gap-2">
        <Download size={16} />
        Exportar CSV
      </button>
      <button type="button" onClick={() => handleOpenModal()} className="btn-primary inline-flex items-center gap-2">
        <Plus size={16} />
        Novo Cliente
      </button>
    </>
  );

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingId(customer.id);
      setFormData({
        ...customer,
        notes: customer.notes || '',
        consents: {
          transactional: customer.consents?.transactional !== false,
          marketing: Boolean(customer.consents?.marketing),
        },
      });
    } else {
      setEditingId(null);
      setFormData({ ...EMPTY_CUSTOMER, userId: currentUser.id });
    }

    setIsModalOpen(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await onUpdate({
          ...formData,
          id: editingId,
          userId: (formData as Customer).userId || currentUser.id,
        });
      } else {
        await onAdd({
          ...formData,
          userId: currentUser.id,
        });
      }
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (customer: CustomerMetricRecord) => {
    if (!window.confirm(`Excluir o cliente "${customer.name}"?`)) return;
    await onDelete(customer.id);
  };

  const handleAddressChange = (field: keyof Customer['address'], value: string) => {
    setFormData((previous) => ({
      ...previous,
      address: {
        ...previous.address,
        [field]: value,
      },
    }));
  };

  const viewingCustomer = enrichedCustomers.find((customer) => customer.id === viewingCustomerId) || null;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-xl font-bold text-rs-gold">Clientes</h2>
          <p className="text-sm text-slate-400">Cadastro real de compradores, métricas comerciais e histórico operacional.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard icon={<Users size={16} />} label="Base de clientes" value={String(summary.totalCustomers)} hint="Cadastros ativos no CD" />
        <SummaryCard icon={<ShoppingCart size={16} />} label="Pedidos vinculados" value={String(summary.totalOrders)} hint="Compras reais registradas" />
        <SummaryCard icon={<TrendingUp size={16} />} label="Receita da base" value={formatCurrency(summary.totalRevenue)} hint="LTV acumulado" />
        <SummaryCard icon={<Mail size={16} />} label="Opt-in marketing" value={String(summary.marketingOptIn)} hint="Liberados para campanha" />
        <SummaryCard icon={<Tag size={16} />} label="Clientes compradores" value={String(summary.activeBase)} hint="Com pelo menos 1 pedido" />
      </div>

      <DataTable
        {...table}
        columns={columns}
        data={table.paginatedData}
        onSort={table.requestSort}
        onSearch={table.setSearchTerm}
        onPageChange={{ next: table.nextPage, prev: table.prevPage, goTo: table.goToPage }}
        onItemsPerPageChange={table.handleItemsPerPageChange}
        searchPlaceholder="Buscar por nome, e-mail, telefone, CPF/CNPJ, endereço, cidade..."
        toolbarContent={toolbarContent}
      />

      <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Cliente' : 'Novo Cliente'}>
        <form onSubmit={handleSave} className="flex h-full flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Nome completo" required>
                <input type="text" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className="input-field" required />
              </FormField>
              <FormField label="Documento (CPF/CNPJ)">
                <input type="text" value={formData.document} onChange={(event) => setFormData({ ...formData, document: event.target.value })} className="input-field" />
              </FormField>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Telefone" required>
                <input type="text" value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} className="input-field" required />
              </FormField>
              <FormField label="E-mail">
                <input type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className="input-field" />
              </FormField>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-rs-gold">Endereço</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField label="CEP">
                  <input type="text" value={formData.address.zipCode} onChange={(event) => handleAddressChange('zipCode', event.target.value)} className="input-field" />
                </FormField>
                <FormField label="Rua / Logradouro" className="md:col-span-2">
                  <input type="text" value={formData.address.street} onChange={(event) => handleAddressChange('street', event.target.value)} className="input-field" />
                </FormField>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-4">
                <FormField label="Número">
                  <input type="text" value={formData.address.number} onChange={(event) => handleAddressChange('number', event.target.value)} className="input-field" />
                </FormField>
                <FormField label="Complemento">
                  <input type="text" value={formData.address.complement || ''} onChange={(event) => handleAddressChange('complement', event.target.value)} className="input-field" />
                </FormField>
                <FormField label="Bairro">
                  <input type="text" value={formData.address.neighborhood} onChange={(event) => handleAddressChange('neighborhood', event.target.value)} className="input-field" />
                </FormField>
                <FormField label="Cidade">
                  <input type="text" value={formData.address.city} onChange={(event) => handleAddressChange('city', event.target.value)} className="input-field" />
                </FormField>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <FormField label="Estado">
                  <input type="text" value={formData.address.state} onChange={(event) => handleAddressChange('state', event.target.value)} className="input-field" />
                </FormField>
                <FormField label="Observações">
                  <input type="text" value={formData.notes || ''} onChange={(event) => setFormData({ ...formData, notes: event.target.value })} className="input-field" />
                </FormField>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-rs-gold">Consentimentos</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={formData.consents?.transactional !== false}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        consents: {
                          transactional: event.target.checked,
                          marketing: Boolean(formData.consents?.marketing),
                        },
                      })
                    }
                  />
                  Receber atualizações transacionais
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.consents?.marketing)}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        consents: {
                          transactional: formData.consents?.transactional !== false,
                          marketing: event.target.checked,
                        },
                      })
                    }
                  />
                  Aceita comunicações de marketing
                </label>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 justify-end gap-3 border-t border-white/10 p-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary inline-flex items-center gap-2" disabled={isSaving}>
              <Save size={16} />
              {isSaving ? 'Salvando...' : 'Salvar Cliente'}
            </button>
          </div>
        </form>
      </ModalWrapper>

      {viewingCustomer ? (
        <CustomerDetailModal
          customer={viewingCustomer}
          orders={orders}
          leads={leads}
          tickets={tickets}
          rmas={rmas}
          onClose={() => setViewingCustomerId(null)}
          onUpdate={onUpdate}
        />
      ) : null}

      <style>{`
        .btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.65rem 1rem;border-radius:0.75rem;transition:all .2s ease}
        .btn-primary:hover{background-color:#e6c24a}
        .btn-secondary{background-color:transparent;border:1px solid rgba(255,255,255,0.1);color:#cbd5e1;padding:0.65rem 1rem;border-radius:0.75rem;transition:all .2s ease}
        .btn-secondary:hover{border-color:rgba(212,175,55,.45);color:#fff}
        .input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.75rem;padding:0.65rem 0.85rem;color:#e2e8f0;outline:none}
        .input-field:focus{border-color:rgba(212,175,55,.45)}
        .select-filter{background-color:rgba(0,0,0,0.45);border:1px solid rgba(255,255,255,0.1);color:#e2e8f0;border-radius:0.75rem;padding:0.6rem 0.85rem;min-width:12rem}
      `}</style>
    </div>
  );
};

interface CustomerDetailModalProps {
  customer: CustomerMetricRecord;
  orders: Order[];
  leads: Lead[];
  tickets: Ticket[];
  rmas: RMA[];
  onClose: () => void;
  onUpdate: (customer: Customer) => void | Promise<Customer | void>;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ customer, orders, leads, tickets, rmas, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'overview'>('timeline');
  const [notes, setNotes] = useState(customer.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const timelineEvents = useMemo(() => {
    const customerOrders = orders
      .filter((order) => order.customerId === customer.id)
      .map((order) => ({ ...order, type: 'order' as const, date: order.date }));

    const customerTickets = tickets
      .filter((ticket) => ticket.customerId === customer.id)
      .map((ticket) => ({ ...ticket, type: 'ticket' as const, date: ticket.createdAt }));

    const customerRmas = rmas
      .filter((rma) => rma.customerId === customer.id)
      .map((rma) => ({ ...rma, type: 'rma' as const, date: rma.createdAt }));

    return [...customerOrders, ...customerTickets, ...customerRmas].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [customer.id, orders, rmas, tickets]);

  const customerLeads = useMemo(
    () =>
      leads.filter(
        (lead) =>
          (lead.phone && customer.phone && lead.phone === customer.phone) ||
          (lead.name && customer.name && lead.name.toLowerCase() === customer.name.toLowerCase())
      ),
    [customer.name, customer.phone, leads]
  );

  const ltv = useMemo(
    () =>
      orders
        .filter((order) => order.customerId === customer.id)
        .reduce((total, order) => total + order.itemsTotal + order.shippingCharged - order.discountTotal, 0),
    [customer.id, orders]
  );

  const avgTicket = customer.frequency > 0 ? ltv / customer.frequency : 0;

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await onUpdate({ ...customer, notes });
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <ModalWrapper isOpen={true} onClose={onClose} title="Visão 360° do Cliente" size="4xl">
      <div className="flex h-full flex-col overflow-hidden">
        <div className="grid gap-4 border-b border-white/10 bg-black/20 p-6 md:grid-cols-2 xl:grid-cols-5">
          <SummaryCard icon={<Users size={16} />} label="Segmento" value={SEGMENT_LABELS[customer.segment]} hint="Classificação automática" />
          <SummaryCard icon={<ShoppingCart size={16} />} label="Pedidos" value={String(customer.frequency)} hint={`Último: ${formatDate(customer.lastOrderDate)}`} />
          <SummaryCard icon={<TrendingUp size={16} />} label="LTV" value={formatCurrency(ltv)} hint={`Ticket médio: ${formatCurrency(avgTicket)}`} />
          <SummaryCard icon={<Headphones size={16} />} label="Tickets / RMA" value={`${tickets.filter((ticket) => ticket.customerId === customer.id).length} / ${rmas.filter((rma) => rma.customerId === customer.id).length}`} hint="Pós-venda real" />
          <SummaryCard icon={<Mail size={16} />} label="Leads vinculados" value={String(customerLeads.length)} hint="Origem/CRM" />
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-white/10 px-6">
          <TabButton isActive={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} icon={<FileText size={16} />} label="Linha do Tempo" />
          <TabButton isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Users size={16} />} label="Cadastro e Consumo" />
        </div>

        <div className="flex-1 overflow-y-auto bg-rs-card p-6">
          {activeTab === 'timeline' ? (
            timelineEvents.length > 0 ? (
              <div className="relative pl-6">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10" />
                {timelineEvents.map((event, index) => (
                  <div key={`${event.type}-${event.id}-${index}`} className="relative mb-8">
                    <div className="absolute -left-[37px] top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/10 bg-rs-card">
                      <EventIcon type={event.type} />
                    </div>
                    <div className="mb-1 text-xs text-slate-500">{new Date(event.date).toLocaleString('pt-BR')}</div>
                    {event.type === 'order' ? <OrderTimelineCard order={event as Order} /> : null}
                    {event.type === 'ticket' ? <TicketTimelineCard ticket={event as Ticket} /> : null}
                    {event.type === 'rma' ? <RmaTimelineCard rma={event as unknown as RMA} /> : null}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyTimelineState />
            )
          ) : (
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <DetailPanel title="Cadastro principal">
                  <DetailGrid
                    items={[
                      ['Nome', customer.name],
                      ['Documento', customer.document || 'Sem documento'],
                      ['Telefone', customer.phone || 'Sem telefone'],
                      ['E-mail', customer.email || 'Sem e-mail'],
                      ['Cidade / UF', customer.cityState],
                      ['Bairro', customer.address.neighborhood || 'Sem bairro'],
                      ['Última compra', formatDate(customer.lastOrderDate)],
                      ['Status último pedido', customer.lastOrderStatus || 'Sem pedidos'],
                    ]}
                  />
                </DetailPanel>

                <DetailPanel title="Endereço">
                  <DetailGrid
                    items={[
                      ['CEP', customer.address.zipCode || 'Não informado'],
                      ['Rua', customer.address.street || 'Não informado'],
                      ['Número', customer.address.number || 'Não informado'],
                      ['Complemento', customer.address.complement || 'Não informado'],
                      ['Cidade', customer.address.city || 'Não informado'],
                      ['Estado', customer.address.state || 'Não informado'],
                    ]}
                  />
                </DetailPanel>

                <DetailPanel title="Observações">
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className="input-field min-h-[140px]"
                    placeholder="Observações comerciais, atendimento, preferências..."
                  />
                  <div className="mt-4 flex justify-end">
                    <button type="button" onClick={() => void handleSaveNotes()} className="btn-primary inline-flex items-center gap-2" disabled={isSavingNotes}>
                      <Save size={16} />
                      {isSavingNotes ? 'Salvando...' : 'Salvar observações'}
                    </button>
                  </div>
                </DetailPanel>
              </div>

              <div className="space-y-6">
                <DetailPanel title="Consentimentos">
                  <div className="grid gap-3">
                    <ConsentCard label="Transacional" active={customer.consents?.transactional !== false} description="Pedidos, cobranças e atualizações operacionais." />
                    <ConsentCard label="Marketing" active={Boolean(customer.consents?.marketing)} description="Campanhas, ofertas, remarketing e comunicações promocionais." />
                  </div>
                </DetailPanel>

                <DetailPanel title="Indicadores comerciais">
                  <DetailGrid
                    items={[
                      ['Pedidos totais', String(customer.frequency)],
                      ['LTV', formatCurrency(ltv)],
                      ['Ticket médio', formatCurrency(avgTicket)],
                      ['Recência', customer.recency >= 9999 ? 'Sem histórico' : `${customer.recency} dia(s)`],
                      ['Leads vinculados', String(customerLeads.length)],
                      ['Último pedido', customer.lastOrderId ? `#${customer.lastOrderId.slice(0, 8)}` : 'Sem pedidos'],
                    ]}
                  />
                </DetailPanel>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};

const SegmentBadge: React.FC<{ segment: CustomerSegment }> = ({ segment }) => (
  <span className="rounded-full border border-rs-goldDim/35 bg-rs-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-rs-gold">
    {SEGMENT_LABELS[segment]}
  </span>
);

const SummaryCard: React.FC<{ icon: React.ReactNode; label: string; value: string; hint: string }> = ({ icon, label, value, hint }) => (
  <div className="rounded-2xl border border-white/10 bg-rs-cardAlt/80 p-4">
    <div className="mb-3 flex items-center justify-between">
      <span className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</span>
      <span className="text-rs-gold">{icon}</span>
    </div>
    <div className="text-xl font-bold text-slate-100">{value}</div>
    <div className="mt-1 text-xs text-slate-500">{hint}</div>
  </div>
);

const FormField: React.FC<{ label: string; required?: boolean; className?: string; children: React.ReactNode }> = ({
  label,
  required,
  className,
  children,
}) => (
  <label className={`block ${className || ''}`}>
    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
      {label}
      {required ? ' *' : ''}
    </span>
    {children}
  </label>
);

const DetailPanel: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
    <div className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-rs-gold">{title}</div>
    {children}
  </div>
);

const DetailGrid: React.FC<{ items: Array<[string, string]> }> = ({ items }) => (
  <div className="grid gap-4 md:grid-cols-2">
    {items.map(([label, value]) => (
      <div key={label} className="rounded-xl border border-white/5 bg-black/20 px-4 py-3">
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
        <div className="mt-1 text-sm font-medium text-slate-100">{value}</div>
      </div>
    ))}
  </div>
);

const ConsentCard: React.FC<{ label: string; active: boolean; description: string }> = ({ label, active, description }) => (
  <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-slate-100">{label}</span>
      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-500/15 text-slate-400'}`}>
        {active ? 'Ativo' : 'Inativo'}
      </span>
    </div>
    <p className="mt-2 text-xs text-slate-500">{description}</p>
  </div>
);

const EmptyTimelineState: React.FC = () => (
  <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 px-6 text-center">
    <FileText size={28} className="mb-3 text-slate-500" />
    <div className="text-sm font-semibold text-slate-200">Sem eventos reais para este cliente</div>
    <div className="mt-2 max-w-md text-xs text-slate-500">
      Quando houver pedidos, tickets ou devoluções vinculadas a este cliente, a linha do tempo será exibida aqui.
    </div>
  </div>
);

const EventIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'order':
      return <ShoppingCart size={16} className="text-rs-gold" />;
    case 'ticket':
      return <Headphones size={16} className="text-blue-300" />;
    case 'rma':
      return <RefreshCw size={16} className="text-orange-300" />;
    default:
      return <FileText size={16} className="text-slate-300" />;
  }
};

const OrderTimelineCard: React.FC<{ order: Order }> = ({ order }) => (
  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="font-semibold text-slate-100">Pedido #{order.id.slice(0, 8)}</div>
        <div className="mt-1 text-xs text-slate-500">
          {order.items.length} item(ns) • {order.salesChannel || 'Canal não informado'}
        </div>
      </div>
      <span className="rounded-full bg-rs-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-rs-gold">
        {order.status}
      </span>
    </div>
    <div className="mt-3 grid gap-3 md:grid-cols-3">
      <InfoPill label="Total" value={formatCurrency(order.itemsTotal + order.shippingCharged - order.discountTotal)} />
      <InfoPill label="Rastreio" value={order.trackingCode || 'Não informado'} />
      <InfoPill label="Pagamento" value={order.paymentMethod || 'Não informado'} />
    </div>
  </div>
);

const TicketTimelineCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => (
  <div className="rounded-xl border border-blue-500/20 bg-blue-900/10 p-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="font-semibold text-blue-200">{ticket.subject}</div>
      <span className="rounded-full bg-blue-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-200">
        {ticket.status}
      </span>
    </div>
    <div className="mt-3 grid gap-3 md:grid-cols-3">
      <InfoPill label="Canal" value={ticket.channel} />
      <InfoPill label="Prioridade" value={ticket.priority} />
      <InfoPill label="Atualizado" value={formatDate(ticket.updatedAt)} />
    </div>
  </div>
);

const RmaTimelineCard: React.FC<{ rma: RMA }> = ({ rma }) => (
  <div className="rounded-xl border border-orange-500/20 bg-orange-900/10 p-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="font-semibold text-orange-200">
        {rma.type} • {rma.reason}
      </div>
      <span className="rounded-full bg-orange-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-200">
        {rma.status}
      </span>
    </div>
    <div className="mt-3 grid gap-3 md:grid-cols-3">
      <InfoPill label="Pedido" value={`#${rma.orderId.slice(0, 8)}`} />
      <InfoPill label="Itens" value={String(rma.items.length)} />
      <InfoPill label="Tipo" value={rma.type} />
    </div>
  </div>
);

const InfoPill: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
    <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
    <div className="mt-1 text-sm font-medium text-slate-100">{value}</div>
  </div>
);
