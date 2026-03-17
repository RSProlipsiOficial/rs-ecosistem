import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  Download,
  Eye,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';
import { Customer, CustomerSegment, CustomerWithMetrics, Order } from '../types';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';
import { ModalWrapper } from './ModalWrapper';
import { crmService } from '../services/crmService';

interface CrmManagerProps {
  customers: Customer[];
  orders: Order[];
}

type SegmentFilter = CustomerSegment | 'Todos';
type ConsentFilter = 'all' | 'marketing' | 'transactional' | 'sem-marketing';

interface CustomerCrmRow extends CustomerWithMetrics {
  avgTicket: number;
  buyer: boolean;
  cityLabel: string;
  stateLabel: string;
  firstOrderDate?: string;
  lastOrderDate?: string;
  lastOrderId?: string;
  lastOrderValue: number;
  lastStatus: string;
  marketingConsent: boolean;
  transactionalConsent: boolean;
  orderCount: number;
  topCampaign: string;
  topChannel: string;
  topProducts: string[];
  totalDiscounts: number;
  totalShipping: number;
  timelineOrders: Order[];
}

const SEGMENTS: SegmentFilter[] = ['Todos', 'VIPs', 'Campeões', 'Leais', 'Potencial', 'Em Risco', 'Hibernando', 'Novos'];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));

const formatDate = (value?: string) => {
  if (!value) return 'Sem pedidos';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sem pedidos';
  return date.toLocaleDateString('pt-BR');
};

const getOrderNetValue = (order: Order) =>
  Number(order.itemsTotal || 0) + Number(order.shippingCharged || 0) - Number(order.discountTotal || 0);

const getChannelLabel = (orders: Order[]) => {
  const counts = new Map<string, number>();
  orders.forEach((order) => {
    const label = String(order.salesChannel || order.utmSource || 'Direto').trim() || 'Direto';
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Direto';
};

const getCampaignLabel = (orders: Order[]) => {
  const counts = new Map<string, number>();
  orders.forEach((order) => {
    const label = String(order.utmCampaign || order.campaign || 'Sem campanha').trim() || 'Sem campanha';
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Sem campanha';
};

const getTopProducts = (orders: Order[]) => {
  const counts = new Map<string, number>();
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const label = item.productName || 'Produto';
      counts.set(label, (counts.get(label) || 0) + Number(item.quantity || 0));
    });
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name]) => name);
};

const segmentTone: Record<CustomerSegment, string> = {
  VIPs: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  Campeões: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  Leais: 'bg-sky-500/15 text-sky-300 border-sky-500/20',
  Potencial: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20',
  'Em Risco': 'bg-orange-500/15 text-orange-300 border-orange-500/20',
  Hibernando: 'bg-rose-500/15 text-rose-300 border-rose-500/20',
  Novos: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
};

const segmentHint: Record<CustomerSegment, string> = {
  VIPs: 'Base premium com maior LTV.',
  Campeões: 'Alta recorrencia e boa resposta comercial.',
  Leais: 'Relacionamento ativo e consistente.',
  Potencial: 'Espaco claro para novas conversoes.',
  'Em Risco': 'Precisa de acao de retencao.',
  Hibernando: 'Sem compra recente, foco em recuperacao.',
  Novos: 'Primeiros passos no funil de relacionamento.',
};

const getHealthLabel = (row: CustomerCrmRow) => {
  if (row.segment === 'VIPs' || row.segment === 'Campeões') return 'Base forte';
  if (row.segment === 'Em Risco' || row.segment === 'Hibernando') return 'Recuperacao';
  if (!row.buyer) return 'Prospeccao';
  return 'Atencao ativa';
};

export const CrmManager: React.FC<CrmManagerProps> = ({ customers, orders }) => {
  const [activeSegment, setActiveSegment] = useState<SegmentFilter>('Todos');
  const [selectedCity, setSelectedCity] = useState('all');
  const [consentFilter, setConsentFilter] = useState<ConsentFilter>('all');
  const [showOnlyBuyers, setShowOnlyBuyers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerCrmRow | null>(null);

  const customerMetrics = useMemo<CustomerCrmRow[]>(() => {
    return customers.map((customer) => {
      const customerOrders = orders
        .filter((order) => order.customerId === customer.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const frequency = customerOrders.length;
      const monetary = customerOrders.reduce((sum, order) => sum + getOrderNetValue(order), 0);
      const avgTicket = frequency > 0 ? monetary / frequency : 0;
      const recency = frequency > 0 ? crmService.calculateRecency(customerOrders[0].date) : 9999;
      const segment = crmService.getCustomerSegment(recency, frequency, monetary);
      const cityLabel = customer.address?.city?.trim() || 'Sem cidade';
      const stateLabel = customer.address?.state?.trim() || '--';
      const marketingConsent = Boolean(customer.consents?.marketing);
      const transactionalConsent = customer.consents?.transactional !== false;
      const totalDiscounts = customerOrders.reduce((sum, order) => sum + Number(order.discountTotal || 0), 0);
      const totalShipping = customerOrders.reduce((sum, order) => sum + Number(order.shippingCharged || 0), 0);

      return {
        ...customer,
        recency,
        frequency,
        monetary,
        segment,
        avgTicket,
        buyer: frequency > 0,
        cityLabel,
        stateLabel,
        firstOrderDate: customerOrders[customerOrders.length - 1]?.date,
        lastOrderDate: customerOrders[0]?.date,
        lastOrderId: customerOrders[0]?.id,
        lastOrderValue: customerOrders[0] ? getOrderNetValue(customerOrders[0]) : 0,
        lastStatus: customerOrders[0]?.status || 'Sem pedidos',
        marketingConsent,
        transactionalConsent,
        orderCount: frequency,
        topChannel: getChannelLabel(customerOrders),
        topCampaign: getCampaignLabel(customerOrders),
        topProducts: getTopProducts(customerOrders),
        totalDiscounts,
        totalShipping,
        timelineOrders: customerOrders.slice(0, 10),
      };
    });
  }, [customers, orders]);

  const segmentCounts = useMemo(() => {
    return SEGMENTS.reduce<Record<SegmentFilter, number>>((acc, segment) => {
      if (segment === 'Todos') {
        acc[segment] = customerMetrics.length;
      } else {
        acc[segment] = customerMetrics.filter((customer) => customer.segment === segment).length;
      }
      return acc;
    }, {} as Record<SegmentFilter, number>);
  }, [customerMetrics]);

  const cities = useMemo(
    () =>
      Array.from(new Set(customerMetrics.map((customer) => customer.cityLabel).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, 'pt-BR')
      ),
    [customerMetrics]
  );

  const filteredCustomers = useMemo(() => {
    return customerMetrics.filter((customer) => {
      if (activeSegment !== 'Todos' && customer.segment !== activeSegment) return false;
      if (selectedCity !== 'all' && customer.cityLabel !== selectedCity) return false;
      if (showOnlyBuyers && !customer.buyer) return false;
      if (consentFilter === 'marketing' && !customer.marketingConsent) return false;
      if (consentFilter === 'transactional' && !customer.transactionalConsent) return false;
      if (consentFilter === 'sem-marketing' && customer.marketingConsent) return false;
      return true;
    });
  }, [activeSegment, consentFilter, customerMetrics, selectedCity, showOnlyBuyers]);

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
      'segment',
      'topChannel',
      'topCampaign',
      'lastStatus',
    ],
  });

  const summary = useMemo(() => {
    const base = filteredCustomers;
    const totalRevenue = base.reduce((sum, customer) => sum + customer.monetary, 0);
    const totalOrders = base.reduce((sum, customer) => sum + customer.orderCount, 0);
    const buyers = base.filter((customer) => customer.buyer).length;
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const vipBase = base.filter((customer) => customer.segment === 'VIPs' || customer.segment === 'Campeões').length;
    const atRiskBase = base.filter((customer) => customer.segment === 'Em Risco' || customer.segment === 'Hibernando').length;
    const marketingOptIn = base.filter((customer) => customer.marketingConsent).length;

    return {
      totalRevenue,
      totalOrders,
      buyers,
      avgTicket,
      vipBase,
      atRiskBase,
      marketingOptIn,
    };
  }, [filteredCustomers]);

  const handleExport = () => {
    const rows = table.filteredAndSortedData;
    if (rows.length === 0) {
      alert('Nenhum cliente para exportar.');
      return;
    }

    const headers = [
      'ID',
      'Nome',
      'Email',
      'Telefone',
      'Documento',
      'Cidade',
      'Estado',
      'Segmento',
      'Recencia',
      'Frequencia',
      'LTV',
      'Ticket Medio',
      'Ultima Compra',
      'Ultimo Status',
      'Canal Principal',
      'Campanha Principal',
      'Marketing',
    ];

    const csvRows = [
      headers.join(';'),
      ...rows.map((customer) =>
        [
          customer.id,
          `"${customer.name}"`,
          customer.email || '',
          customer.phone || '',
          customer.document || '',
          customer.cityLabel,
          customer.stateLabel,
          customer.segment,
          customer.recency === 9999 ? '' : customer.recency,
          customer.frequency,
          customer.monetary.toFixed(2),
          customer.avgTicket.toFixed(2),
          customer.lastOrderDate || '',
          customer.lastStatus,
          customer.topChannel,
          customer.topCampaign,
          customer.marketingConsent ? 'SIM' : 'NAO',
        ].join(';')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `crm_clientes_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<CustomerCrmRow>[] = [
    {
      header: 'Cliente',
      accessor: 'name',
      sortable: true,
      render: (customer) => (
        <div>
          <div className="font-bold text-slate-100">{customer.name}</div>
          <div className="mt-1 text-xs text-slate-500">
            {customer.email || 'Sem e-mail'} {' • '} {customer.phone || 'Sem telefone'}
          </div>
        </div>
      ),
    },
    {
      header: 'Segmento',
      accessor: 'segment',
      sortable: true,
      render: (customer) => <SegmentChip segment={customer.segment} />,
    },
    {
      header: 'Localidade',
      accessor: 'cityLabel',
      sortable: true,
      render: (customer) => (
        <div>
          <div className="text-sm font-semibold text-slate-200">{customer.cityLabel}</div>
          <div className="text-xs text-slate-500">{customer.stateLabel}</div>
        </div>
      ),
    },
    {
      header: 'Ultima compra',
      accessor: 'lastOrderDate',
      sortable: true,
      render: (customer) => (
        <div>
          <div className="text-sm font-semibold text-slate-200">{formatDate(customer.lastOrderDate)}</div>
          <div className="text-xs text-slate-500">{customer.lastStatus}</div>
        </div>
      ),
    },
    {
      header: 'Pedidos',
      accessor: 'frequency',
      sortable: true,
      render: (customer) => <span className="font-semibold text-slate-200">{customer.frequency}</span>,
    },
    {
      header: 'LTV',
      accessor: 'monetary',
      sortable: true,
      render: (customer) => <span className="font-semibold text-rs-gold">{formatCurrency(customer.monetary)}</span>,
    },
    {
      header: 'Ticket medio',
      accessor: 'avgTicket',
      sortable: true,
      render: (customer) => <span className="text-slate-300">{formatCurrency(customer.avgTicket)}</span>,
    },
    {
      header: 'Acoes',
      accessor: 'id',
      render: (customer) => (
        <button onClick={() => setSelectedCustomer(customer)} className="btn-secondary flex items-center gap-2">
          <Eye size={15} />
          Ver 360
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-rs-gold">
            <UserCheck size={20} />
            CRM Clientes
          </h2>
          <p className="text-sm text-slate-400">
            Segmentacao comercial, recencia, LTV e leitura 360 da base usando clientes e pedidos reais do Supabase.
          </p>
        </div>
        <button onClick={handleExport} className="btn-secondary flex items-center gap-2 self-start">
          <Download size={16} />
          Exportar CRM
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <SummaryCard icon={<Users size={16} />} label="Base filtrada" value={String(filteredCustomers.length)} hint="Clientes visiveis no CRM" />
        <SummaryCard icon={<ShoppingCart size={16} />} label="Compradores" value={String(summary.buyers)} hint="Com pelo menos 1 pedido" />
        <SummaryCard icon={<Wallet size={16} />} label="LTV total" value={formatCurrency(summary.totalRevenue)} hint="Receita acumulada da base" />
        <SummaryCard icon={<TrendingUp size={16} />} label="Ticket medio" value={formatCurrency(summary.avgTicket)} hint="Media dos pedidos" />
        <SummaryCard icon={<Target size={16} />} label="VIPs / Campeoes" value={String(summary.vipBase)} hint="Base premium ativa" />
        <SummaryCard icon={<AlertTriangle size={16} />} label="Em risco" value={String(summary.atRiskBase)} hint="Clientes para recuperacao" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricPanel label="Pedidos na base" value={String(summary.totalOrders)} />
        <MetricPanel label="Opt-in marketing" value={String(summary.marketingOptIn)} />
        <MetricPanel label="Cidade lider" value={cities[0] || 'Sem cidade'} />
        <MetricPanel label="Filtro atual" value={activeSegment === 'Todos' ? 'Base completa' : activeSegment} />
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-xl border border-white/10 bg-rs-dark p-2">
        {SEGMENTS.map((segment) => (
          <button
            key={segment}
            onClick={() => setActiveSegment(segment)}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition-all ${
              activeSegment === segment ? 'bg-rs-gold text-rs-black' : 'bg-black/20 text-slate-300 hover:bg-white/5'
            }`}
          >
            {segment} <span className="ml-2 rounded-full bg-black/20 px-1.5 py-0.5 text-[10px]">{segmentCounts[segment] || 0}</span>
          </button>
        ))}
      </div>

      <DataTable
        {...table}
        columns={columns}
        data={table.paginatedData}
        onSort={table.requestSort}
        onSearch={table.setSearchTerm}
        onPageChange={{ next: table.nextPage, prev: table.prevPage, goTo: table.goToPage }}
        onItemsPerPageChange={table.handleItemsPerPageChange}
        searchPlaceholder="Buscar por nome, e-mail, telefone, CPF/CNPJ, cidade, endereco, segmento ou campanha..."
        toolbarContent={
          <>
            <select
              value={selectedCity}
              onChange={(event) => setSelectedCity(event.target.value)}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-slate-200 outline-none"
            >
              <option value="all">Todas as cidades</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <select
              value={consentFilter}
              onChange={(event) => setConsentFilter(event.target.value as ConsentFilter)}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-slate-200 outline-none"
            >
              <option value="all">Todos os consentimentos</option>
              <option value="marketing">Com opt-in marketing</option>
              <option value="sem-marketing">Sem opt-in marketing</option>
              <option value="transactional">Consentimento transacional</option>
            </select>
            <button
              onClick={() => setShowOnlyBuyers((prev) => !prev)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                showOnlyBuyers ? 'border-rs-gold bg-rs-gold/10 text-rs-gold' : 'border-white/10 bg-black/30 text-slate-300'
              }`}
            >
              Somente compradores
            </button>
          </>
        }
      />

      <ModalWrapper
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer ? `CRM 360 • ${selectedCustomer.name}` : 'CRM 360'}
        size="5xl"
      >
        {selectedCustomer ? (
          <div className="space-y-6 p-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              <MetricPanel label="Segmento" value={selectedCustomer.segment} compact />
              <MetricPanel label="Recencia" value={selectedCustomer.recency === 9999 ? 'Sem pedidos' : `${selectedCustomer.recency} dias`} compact />
              <MetricPanel label="Frequencia" value={String(selectedCustomer.frequency)} compact />
              <MetricPanel label="LTV" value={formatCurrency(selectedCustomer.monetary)} compact />
              <MetricPanel label="Ticket medio" value={formatCurrency(selectedCustomer.avgTicket)} compact />
              <MetricPanel label="Saude da conta" value={getHealthLabel(selectedCustomer)} compact />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_1.1fr_1.4fr]">
              <div className="space-y-4">
                <PanelCard title="Identidade do cliente" icon={<Users size={16} />}>
                  <DetailRow label="Nome" value={selectedCustomer.name} />
                  <DetailRow label="E-mail" value={selectedCustomer.email || 'Sem e-mail'} icon={<Mail size={14} />} />
                  <DetailRow label="Telefone" value={selectedCustomer.phone || 'Sem telefone'} icon={<Phone size={14} />} />
                  <DetailRow label="Documento" value={selectedCustomer.document || 'Sem documento'} />
                  <DetailRow label="Endereco" value={buildAddressLabel(selectedCustomer)} icon={<MapPin size={14} />} />
                </PanelCard>

                <PanelCard title="Consentimento e relacionamento" icon={<ShieldCheck size={16} />}>
                  <DetailRow label="Marketing" value={selectedCustomer.marketingConsent ? 'Autorizado' : 'Nao autorizado'} />
                  <DetailRow label="Transacional" value={selectedCustomer.transactionalConsent ? 'Autorizado' : 'Nao autorizado'} />
                  <DetailRow label="Primeira compra" value={formatDate(selectedCustomer.firstOrderDate)} icon={<CalendarDays size={14} />} />
                  <DetailRow label="Ultima compra" value={formatDate(selectedCustomer.lastOrderDate)} icon={<Clock3 size={14} />} />
                  <DetailRow label="Ultimo status" value={selectedCustomer.lastStatus} />
                </PanelCard>
              </div>

              <div className="space-y-4">
                <PanelCard title="Performance comercial" icon={<TrendingUp size={16} />}>
                  <DetailRow label="Canal principal" value={selectedCustomer.topChannel} />
                  <DetailRow label="Campanha principal" value={selectedCustomer.topCampaign} icon={<Tag size={14} />} />
                  <DetailRow label="Ultimo pedido" value={selectedCustomer.lastOrderId ? selectedCustomer.lastOrderId.slice(0, 8).toUpperCase() : 'Sem pedido'} />
                  <DetailRow label="Valor ultimo pedido" value={formatCurrency(selectedCustomer.lastOrderValue)} />
                  <DetailRow label="Total descontos" value={formatCurrency(selectedCustomer.totalDiscounts)} />
                  <DetailRow label="Frete acumulado" value={formatCurrency(selectedCustomer.totalShipping)} />
                </PanelCard>

                <PanelCard title="Mix de compra" icon={<ShoppingCart size={16} />}>
                  {selectedCustomer.topProducts.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCustomer.topProducts.map((product) => (
                        <div key={product} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-medium text-slate-200">
                          {product}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyPanelMessage message="Este cliente ainda nao possui itens comprados para compor um mix real." />
                  )}
                </PanelCard>
              </div>

              <PanelCard title="Linha do tempo de pedidos" icon={<CalendarDays size={16} />}>
                {selectedCustomer.timelineOrders.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCustomer.timelineOrders.map((order) => (
                      <div key={order.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-slate-100">Pedido {order.id.slice(0, 8).toUpperCase()}</div>
                            <div className="mt-1 text-xs text-slate-500">
                              {formatDate(order.date)} {' • '} {order.salesChannel || order.utmSource || 'Direto'}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              Campanha: {order.utmCampaign || order.campaign || 'Sem campanha'}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              Itens: {order.items.length} {' • '} Rastreio: {order.trackingCode || 'Sem rastreio'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-rs-gold">{formatCurrency(getOrderNetValue(order))}</div>
                            <div className="mt-1 text-xs text-slate-500">{order.status}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyPanelMessage message="Este cliente ainda nao possui pedidos reais no CD." />
                )}
              </PanelCard>
            </div>
          </div>
        ) : null}
      </ModalWrapper>

      <style>{`
        .btn-secondary{border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.75rem;transition:all .2s ease}
        .btn-secondary:hover{border-color:rgba(212,175,55,.35);color:#fff}
      `}</style>
    </div>
  );
};

const SummaryCard: React.FC<{ icon: React.ReactNode; label: string; value: string; hint: string }> = ({ icon, label, value, hint }) => (
  <div className="rounded-xl border border-rs-goldDim/20 bg-rs-card p-4">
    <div className="flex items-center justify-between">
      <span className="text-rs-gold">{icon}</span>
      <span className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{label}</span>
    </div>
    <div className="mt-3 text-2xl font-black text-slate-100">{value}</div>
    <div className="mt-1 text-xs text-slate-500">{hint}</div>
  </div>
);

const MetricPanel: React.FC<{ label: string; value: string; compact?: boolean }> = ({ label, value, compact = false }) => (
  <div className={`rounded-xl border border-white/10 bg-black/20 ${compact ? 'p-3' : 'p-4'}`}>
    <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{label}</div>
    <div className={`mt-2 font-bold text-slate-100 ${compact ? 'text-lg' : 'text-xl'}`}>{value}</div>
  </div>
);

const SegmentChip: React.FC<{ segment: CustomerSegment }> = ({ segment }) => (
  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${segmentTone[segment]}`}>{segment}</span>
);

const PanelCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="rounded-2xl border border-white/10 bg-rs-card p-4">
    <div className="mb-4 flex items-center gap-2 text-sm font-bold text-rs-gold">
      {icon}
      {title}
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const DetailRow: React.FC<{ label: string; value: string; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
    <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-500">
      {icon}
      {label}
    </div>
    <div className="text-sm font-semibold text-slate-100">{value}</div>
  </div>
);

const EmptyPanelMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-slate-500">{message}</div>
);

const buildAddressLabel = (customer: CustomerCrmRow) => {
  const parts = [
    customer.address?.street,
    customer.address?.number,
    customer.address?.complement,
    customer.address?.neighborhood,
    customer.address?.city,
    customer.address?.state,
    customer.address?.zipCode,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : 'Sem endereco';
};
