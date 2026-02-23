import React, { useState, useMemo, useEffect } from 'react';
import { BioSite, UserProfile, AgencyClient, ClientPayment, SystemLog, Agency, PlanDefinition } from '../types';
import { PLANS } from '../constants';
import {
  LayoutDashboard, Users, Briefcase, DollarSign, Settings, LogOut,
  Search, Shield, Crown, Globe, ChevronRight, TrendingUp, AlertCircle, FileText, Clock, X, Trash2, Edit2, Plus, Save, User, MapPin, Phone, Calendar, FileType, ChevronDown, ChevronUp, Eye, ShoppingBag
} from 'lucide-react';

interface AdminDashboardProps {
  user: UserProfile;
  sites: BioSite[];
  clients: AgencyClient[];
  payments: ClientPayment[];
  agencies: Agency[];
  logs?: SystemLog[];
  plans?: Record<string, PlanDefinition>;
  globalSettings?: { pixKey: string; supportEmail: string; platformName: string; mpPublicKey: string; mpAccessToken: string };
  onAddAgency: (agency: Omit<Agency, 'id' | 'createdAt'>) => void;
  onUpdateAgency: (agency: Agency) => void;
  onDeleteAgency: (id: string) => void;
  onAddClient: (client: any) => void;
  onUpdateClient: (client: AgencyClient) => void;
  onDeleteClient: (id: string) => void;
  onAddPayment: (payment: any) => void;
  onUpdatePlans?: (plans: Record<string, PlanDefinition>) => void;
  onUpdateSettings?: (settings: { pixKey: string; supportEmail: string; platformName: string; mpPublicKey: string; mpAccessToken: string }) => void;
  onLogout: () => void;
  onBackToApp: () => void;
}

type AdminTab = 'dashboard' | 'agencies' | 'clients' | 'sites' | 'packages' | 'walletpay' | 'plans' | 'settings' | 'logs';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user, sites, clients, payments, logs = [], agencies = [],
  plans = {}, globalSettings = { pixKey: '', supportEmail: '', platformName: 'RS MiniSite', mpPublicKey: '', mpAccessToken: '' },
  onAddAgency, onUpdateAgency, onDeleteAgency,
  onAddClient, onUpdateClient, onDeleteClient,
  onAddPayment, onUpdatePlans, onUpdateSettings,
  onLogout, onBackToApp
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // -- Sync Total State --
  const [isEditingPlans, setIsEditingPlans] = useState(false);
  const [tempPlans, setTempPlans] = useState<Record<string, PlanDefinition>>(plans);
  const [tempSettings, setTempSettings] = useState(globalSettings);

  // Sync temp state when props change
  useEffect(() => {
    setTempPlans(plans);
  }, [plans]);

  useEffect(() => {
    // Only update tempSettings if they are currently different from global
    // to avoid clearing while user is typing in a different field
    if (JSON.stringify(globalSettings) !== JSON.stringify(tempSettings)) {
      setTempSettings(globalSettings);
    }
  }, [globalSettings]);

  // -- Agency Management State --
  const [isAgencyModalOpen, setIsAgencyModalOpen] = useState(false);
  const [editingAgencyId, setEditingAgencyId] = useState<string | null>(null);
  const [agencyForm, setAgencyForm] = useState({
    name: '',
    email: '',
    clientsCount: 0,
    revenue: 0,
    status: 'active' as 'active' | 'inactive'
  });

  // -- Client Management State --
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  // Expanded Client Form State
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    agencyId: '',
    status: 'active' as 'active' | 'inactive',
    phone: '',
    cpf: '',
    birthDate: '',
    notes: '',
    // Address Fields
    addressLine: '',
    addressNumber: '',
    addressCity: '',
    addressState: '',
    addressZip: '',
    monthlyFee: 0 // New field
  });

  // -- Sites Management State --
  const [expandedOwnerId, setExpandedOwnerId] = useState<string | null>(null);

  // --- AGENCY HANDLERS ---
  const handleOpenNewAgency = () => {
    setEditingAgencyId(null);
    setAgencyForm({ name: '', email: '', clientsCount: 0, revenue: 0, status: 'active' });
    setIsAgencyModalOpen(true);
  };

  const handleOpenEditAgency = (agency: Agency) => {
    setEditingAgencyId(agency.id);
    setAgencyForm({
      name: agency.name,
      email: agency.email,
      clientsCount: agency.clientsCount,
      revenue: agency.revenue,
      status: agency.status
    });
    setIsAgencyModalOpen(true);
  };

  const handleSaveAgency = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAgencyId) {
      if (onUpdateAgency) {
        const original = agencies.find(a => a.id === editingAgencyId);
        if (original) onUpdateAgency({ ...original, ...agencyForm });
      }
    } else {
      if (onAddAgency) onAddAgency(agencyForm);
    }
    setIsAgencyModalOpen(false);
  };

  const handleDeleteAgencyClick = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a agência "${name}"?`)) {
      if (onDeleteAgency) onDeleteAgency(id);
    }
  };

  // --- CLIENT HANDLERS ---
  const handleOpenNewClient = () => {
    setEditingClientId(null);
    const defaultAgencyId = agencies.length > 0 ? agencies[0].id : '';
    setClientForm({
      name: '', email: '', agencyId: defaultAgencyId, status: 'active', phone: '', cpf: '', birthDate: '', notes: '',
      addressLine: '', addressNumber: '', addressCity: '', addressState: '', addressZip: '', monthlyFee: 0
    });
    setIsClientModalOpen(true);
  };

  const handleOpenEditClient = (client: AgencyClient) => {
    setEditingClientId(client.id);
    setClientForm({
      name: client.name,
      email: client.email,
      agencyId: client.agencyId,
      status: client.status,
      phone: client.phone || '',
      cpf: client.cpf || '',
      birthDate: client.birthDate || '',
      notes: client.notes || '',
      addressLine: client.address?.line || '',
      addressNumber: client.address?.number || '',
      addressCity: client.address?.city || '',
      addressState: client.address?.state || '',
      addressZip: client.address?.zip || '',
      monthlyFee: client.monthlyFee || 0
    });
    setIsClientModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...clientForm,
      // Reconstruct address object
      address: {
        line: clientForm.addressLine,
        number: clientForm.addressNumber,
        city: clientForm.addressCity,
        state: clientForm.addressState,
        zip: clientForm.addressZip
      }
    };

    if (editingClientId) {
      if (onUpdateClient) {
        const original = clients.find(c => c.id === editingClientId);
        if (original) onUpdateClient({ ...original, ...payload });
      }
    } else {
      if (onAddClient) onAddClient(payload);
    }
    setIsClientModalOpen(false);
  };

  const handleDeleteClientClick = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${name}"?`)) {
      if (onDeleteClient) onDeleteClient(id);
    }
  };

  // --- SITES GROUPING LOGIC ---
  const sitesByOwner = useMemo(() => {
    const grouped: Record<string, { ownerName: string, ownerType: string, sites: BioSite[], totalViews: number }> = {};

    sites.forEach(site => {
      const ownerId = site.userId;
      if (!grouped[ownerId]) {
        // Try to find name in agencies
        const agency = agencies.find(a => a.id === ownerId);
        // Or check if it's the admin user (current user)
        const isMe = user.id === ownerId;

        let ownerName = isMe ? `${user.name} (Admin)` : 'Usuário Desconhecido';
        let ownerType = isMe ? 'Admin' : 'Usuário';

        if (agency) {
          ownerName = agency.name;
          ownerType = 'Agência';
        } else if (!isMe) {
          // Fallback for demo: Check if it matches any mock ID pattern or simple fallback
          ownerName = `Consultor ID: ${ownerId.substr(0, 5)}`;
        }

        grouped[ownerId] = {
          ownerName,
          ownerType,
          sites: [],
          totalViews: 0
        };
      }
      grouped[ownerId].sites.push(site);
      grouped[ownerId].totalViews += site.views;
    });

    return Object.entries(grouped).map(([id, data]) => ({
      id,
      ...data
    }));
  }, [sites, agencies, user]);


  // Calculated Stats
  const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0) + agencies.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalSites = sites.length;
  const totalClients = clients.length;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Visão Geral Global</h2>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-rs-dark p-6 rounded-xl border border-gray-200 dark:border-rs-gray shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                    <DollarSign size={24} />
                  </div>
                  <span className="text-xs font-bold text-green-500 flex items-center gap-1 bg-green-50 dark:bg-green-900/10 px-2 py-1 rounded-full">
                    <TrendingUp size={12} /> +18%
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receita Total (MRR)</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">R$ {totalRevenue.toLocaleString('pt-BR')}</h3>
              </div>

              <div className="bg-white dark:bg-rs-dark p-6 rounded-xl border border-gray-200 dark:border-rs-gray shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                    <Shield size={24} />
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Agências Ativas</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{agencies.length}</h3>
              </div>

              <div className="bg-white dark:bg-rs-dark p-6 rounded-xl border border-gray-200 dark:border-rs-gray shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <Users size={24} />
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Clientes Finais</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalClients}</h3>
              </div>

              <div className="bg-white dark:bg-rs-dark p-6 rounded-xl border border-gray-200 dark:border-rs-gray shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-rs-goldLight dark:bg-rs-gold/20 rounded-lg text-rs-goldDark dark:text-rs-gold">
                    <Globe size={24} />
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">MiniSites Publicados</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalSites}</h3>
              </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white dark:bg-rs-dark rounded-xl border border-gray-200 dark:border-rs-gray overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-rs-gray">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Transações Recentes</h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {payments.slice(0, 5).map(payment => (
                  <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                        <DollarSign size={16} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Pagamento Recebido</p>
                        <p className="text-xs text-gray-500">{new Date(payment.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="font-bold text-green-600 dark:text-green-400">+ R$ {payment.amount.toFixed(2)}</span>
                  </div>
                ))}
                {payments.length === 0 && <div className="p-6 text-center text-gray-500">Sem dados financeiros.</div>}
              </div>
            </div>
          </div>
        );

      // WalletPay is handled by external redirection in the sidebar, 
      // but we keep the case here as a fallback or for a placeholder.
      case 'walletpay':
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <div className="w-20 h-20 bg-rs-gold/10 rounded-full flex items-center justify-center text-rs-gold">
              <DollarSign size={40} />
            </div>
            <h2 className="text-2xl font-serif font-bold dark:text-white">Redirecionando para WalletPay...</h2>
            <p className="text-gray-500 max-w-md">O portal financeiro consolidado está sendo aberto em uma nova aba para sua segurança e conveniência.</p>
            <button
              onClick={() => window.open('http://localhost:3004/#/app/dashboard', '_blank')}
              className="bg-rs-goldDark dark:bg-rs-gold text-black px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-all"
            >
              Abrir WalletPay Agora
            </button>
          </div>
        );

      case 'agencies':
        return (
          <div className="space-y-6 animate-fade-in relative">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Agências Parceiras</h2>
              <button
                onClick={handleOpenNewAgency}
                className="bg-rs-goldDark dark:bg-rs-gold text-black px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 flex items-center gap-2"
              >
                <Plus size={16} />
                Nova Agência
              </button>
            </div>

            <div className="bg-white dark:bg-rs-dark rounded-xl border border-gray-200 dark:border-rs-gray overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-black/20 text-gray-500 font-bold uppercase text-xs">
                  <tr>
                    <th className="p-4">Nome</th>
                    <th className="p-4">Email</th>
                    <th className="p-4 text-center">Plano</th>
                    <th className="p-4 text-center">Clientes</th>
                    <th className="p-4 text-right">Faturamento</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {agencies.map(agency => (
                    <tr key={agency.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="p-4 font-bold text-gray-900 dark:text-white">{agency.name}</td>
                      <td className="p-4 text-gray-500">{agency.email}</td>
                      <td className="p-4 text-center">
                        <span className="text-[10px] px-2 py-1 rounded bg-rs-gold/10 text-rs-goldDark dark:text-rs-gold border border-rs-gold/20 font-bold uppercase">
                          {agency.plan || 'Free'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded text-xs font-bold">
                          {clients.filter(c => c.agencyId === agency.id).length}
                        </span>
                      </td>
                      <td className="p-4 text-right text-gray-900 dark:text-white font-mono">R$ {(clients.filter(c => c.agencyId === agency.id).reduce((acc, c) => acc + (c.monthlyFee || 0), 0)).toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <span className={`text-[10px] px-2 py-1 rounded border uppercase font-bold ${agency.status === 'active' ? 'border-green-500 text-green-500' : 'border-gray-500 text-gray-500'
                          }`}>
                          {agency.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditAgency(agency)}
                            className="text-rs-goldDark hover:underline font-bold text-xs"
                          >
                            Gerenciar
                          </button>
                          <button
                            onClick={() => handleDeleteAgencyClick(agency.id, agency.name)}
                            className="text-red-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10"
                            title="Excluir"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {agencies.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-gray-500">Nenhuma agência encontrada.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* MODAL FOR AGENCY FORM */}
            {isAgencyModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                <div className="w-full max-w-lg bg-white dark:bg-rs-dark border border-gray-200 dark:border-rs-gold/30 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-black/20 shrink-0">
                    <h3 className="font-serif font-bold text-xl text-gray-900 dark:text-white">
                      {editingAgencyId ? 'Gerenciar Agência' : 'Nova Agência'}
                    </h3>
                    <button onClick={() => setIsAgencyModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="overflow-y-auto p-6">
                    <form onSubmit={handleSaveAgency} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome da Agência</label>
                        <input
                          type="text"
                          required
                          className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                          value={agencyForm.name}
                          onChange={e => setAgencyForm({ ...agencyForm, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail Administrativo</label>
                        <input
                          type="email"
                          required
                          className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                          value={agencyForm.email}
                          onChange={e => setAgencyForm({ ...agencyForm, email: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                          <select
                            className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                            value={agencyForm.status}
                            onChange={e => setAgencyForm({ ...agencyForm, status: e.target.value as 'active' | 'inactive' })}
                          >
                            <option value="active">Ativo</option>
                            <option value="inactive">Inativo</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Faturamento (R$)</label>
                          <input
                            type="number"
                            min="0"
                            className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                            value={agencyForm.revenue}
                            onChange={e => setAgencyForm({ ...agencyForm, revenue: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </div>

                      <div className="pt-4 flex gap-3 justify-end">
                        <button
                          type="button"
                          onClick={() => setIsAgencyModalOpen(false)}
                          className="px-4 py-2 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold text-sm"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-rs-goldDark dark:bg-rs-gold text-black rounded-lg font-bold text-sm hover:opacity-90 flex items-center gap-2"
                        >
                          <Save size={16} />
                          Salvar Alterações
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'clients':
        return (
          <div className="space-y-6 animate-fade-in relative">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Clientes Finais</h2>
              <button
                onClick={handleOpenNewClient}
                className="bg-rs-goldDark dark:bg-rs-gold text-black px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 flex items-center gap-2"
              >
                <UserPlusIcon />
                Novo Cliente
              </button>
            </div>

            <div className="bg-white dark:bg-rs-dark rounded-xl border border-gray-200 dark:border-rs-gray overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-rs-gray flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar cliente por nome ou email..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-rs-gray rounded-lg outline-none focus:border-rs-gold text-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-black/20 text-gray-500 font-bold uppercase text-xs">
                  <tr>
                    <th className="p-4">Nome do Cliente</th>
                    <th className="p-4">Agência</th>
                    <th className="p-4 text-center">Mensalidade</th>
                    <th className="p-4 text-center">Comissão (10%)</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {clients
                    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(client => {
                      const responsibleAgency = agencies.find(a => a.id === client.agencyId);
                      return (
                        <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                          <td className="p-4">
                            <div className="font-bold text-gray-900 dark:text-white">{client.name}</div>
                            <div className="text-gray-500 text-xs">{client.email}</div>
                          </td>
                          <td className="p-4">
                            {responsibleAgency ? (
                              <span className="text-xs bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                {responsibleAgency.name}
                              </span>
                            ) : <span className="text-xs text-red-500">Não vinculado</span>}
                          </td>
                          <td className="p-4 text-center font-mono">
                            R$ {(client.monthlyFee || 0).toFixed(2)}
                          </td>
                          <td className="p-4 text-center text-green-500 font-bold font-mono text-xs">
                            R$ {((client.monthlyFee || 0) * 0.10).toFixed(2)}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`text-[10px] px-2 py-1 rounded border uppercase font-bold ${client.status === 'active' ? 'border-green-500 text-green-500' : 'border-gray-500 text-gray-500'
                              }`}>
                              {client.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenEditClient(client)}
                                className="text-rs-goldDark hover:underline font-bold text-xs"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteClientClick(client.id, client.name)}
                                className="text-red-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10"
                                title="Excluir"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  {clients.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-gray-500">Nenhum cliente cadastrado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* MODAL CLIENT: EXTENDED & SCROLLABLE */}
            {isClientModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                <div className="w-full max-w-2xl bg-white dark:bg-rs-dark border border-gray-200 dark:border-rs-gold/30 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-black/20 shrink-0">
                    <h3 className="font-serif font-bold text-xl text-gray-900 dark:text-white">
                      {editingClientId ? 'Editar Cliente' : 'Novo Cliente'}
                    </h3>
                    <button onClick={() => setIsClientModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  {/* SCROLLABLE CONTENT AREA */}
                  <div className="overflow-y-auto p-6 custom-scrollbar">
                    <form onSubmit={handleSaveClient} className="space-y-6">

                      {/* Financial Section */}
                      <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-rs-goldDark dark:text-rs-gold uppercase tracking-widest mb-3 flex items-center gap-2">
                          <DollarSign size={14} /> Financeiro
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor Mensalidade (R$)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold font-bold"
                              value={clientForm.monthlyFee}
                              onChange={e => setClientForm({ ...clientForm, monthlyFee: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                          <div className="flex flex-col justify-center text-xs space-y-1 opacity-70">
                            <p>Comissão Plataforma (10%): <span className="font-bold">R$ {(clientForm.monthlyFee * 0.10).toFixed(2)}</span></p>
                            <p>Receita Agência (90%): <span className="font-bold">R$ {(clientForm.monthlyFee * 0.90).toFixed(2)}</span></p>
                          </div>
                        </div>
                      </div>

                      {/* Section 1: Basic Info */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-rs-goldDark dark:text-rs-gold uppercase tracking-widest border-b border-gray-200 dark:border-rs-gray pb-2">Dados Pessoais</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
                            <input
                              type="text"
                              required
                              className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                              value={clientForm.name}
                              onChange={e => setClientForm({ ...clientForm, name: e.target.value })}
                            />
                          </div>
                          <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail</label>
                            <input
                              type="email"
                              required
                              className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                              value={clientForm.email}
                              onChange={e => setClientForm({ ...clientForm, email: e.target.value })}
                            />
                          </div>
                          <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone / WhatsApp</label>
                            <input
                              type="text"
                              className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                              value={clientForm.phone}
                              onChange={e => setClientForm({ ...clientForm, phone: e.target.value })}
                              placeholder="(00) 00000-0000"
                            />
                          </div>
                          <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CPF</label>
                            <input
                              type="text"
                              className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                              value={clientForm.cpf}
                              onChange={e => setClientForm({ ...clientForm, cpf: e.target.value })}
                              placeholder="000.000.000-00"
                            />
                          </div>
                          <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data de Nascimento</label>
                            <input
                              type="date"
                              className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                              value={clientForm.birthDate}
                              onChange={e => setClientForm({ ...clientForm, birthDate: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Address */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-rs-goldDark dark:text-rs-gold uppercase tracking-widest border-b border-gray-200 dark:border-rs-gray pb-2">Endereço</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CEP</label>
                            <input
                              type="text"
                              className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                              value={clientForm.addressZip}
                              onChange={e => setClientForm({ ...clientForm, addressZip: e.target.value })}
                            />
                          </div>
                          <div className="col-span-3">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Logradouro (Rua, Av)</label>
                            <input
                              type="text"
                              className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                              value={clientForm.addressLine}
                              onChange={e => setClientForm({ ...clientForm, addressLine: e.target.value })}
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Número</label>
                            <input
                              type="text"
                              className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                              value={clientForm.addressNumber}
                              onChange={e => setClientForm({ ...clientForm, addressNumber: e.target.value })}
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cidade</label>
                            <input
                              type="text"
                              className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                              value={clientForm.addressCity}
                              onChange={e => setClientForm({ ...clientForm, addressCity: e.target.value })}
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estado</label>
                            <input
                              type="text"
                              className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                              value={clientForm.addressState}
                              onChange={e => setClientForm({ ...clientForm, addressState: e.target.value })}
                              placeholder="UF"
                              maxLength={2}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Management */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-rs-goldDark dark:text-rs-gold uppercase tracking-widest border-b border-gray-200 dark:border-rs-gray pb-2">Gestão</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Agência Responsável</label>
                            <select
                              className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                              value={clientForm.agencyId}
                              onChange={e => setClientForm({ ...clientForm, agencyId: e.target.value })}
                            >
                              <option value="">Selecione uma Agência</option>
                              {agencies.map(a => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                            <select
                              className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                              value={clientForm.status}
                              onChange={e => setClientForm({ ...clientForm, status: e.target.value as 'active' | 'inactive' })}
                            >
                              <option value="active">Ativo</option>
                              <option value="inactive">Inativo</option>
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notas Internas</label>
                            <textarea
                              className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                              rows={3}
                              value={clientForm.notes}
                              onChange={e => setClientForm({ ...clientForm, notes: e.target.value })}
                              placeholder="Informações adicionais sobre este cliente..."
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex gap-3 justify-end">
                        <button
                          type="button"
                          onClick={() => setIsClientModalOpen(false)}
                          className="px-4 py-2 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold text-sm"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-rs-goldDark dark:bg-rs-gold text-black rounded-lg font-bold text-sm hover:opacity-90 flex items-center gap-2"
                        >
                          <Save size={16} />
                          Salvar Cliente
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'packages':
        return (
          <div className="space-y-6 animate-fade-in text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-serif font-bold dark:text-white">Kits & Pacotes RS</h2>
                <p className="text-gray-500">Sincronização automática com checkout seguro.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['Start', 'Pro', 'Agente'].map((kit) => (
                <div key={kit} className="bg-white dark:bg-rs-dark p-6 rounded-xl border border-rs-gold/20 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Kit RS {kit}</h3>
                    <p className="text-sm text-gray-500 mb-4">Este kit usa automaticamente as credenciais do Mercado Pago configuradas.</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-green-500 bg-green-500/10 p-2 rounded">
                        <Shield size={14} /> Checkout Master Ativo
                      </div>
                      <div className="flex items-center gap-2 text-xs text-blue-500 bg-blue-500/10 p-2 rounded">
                        <Globe size={14} /> Link de Venda: {window.location.origin}/checkout/{kit.toLowerCase()}
                      </div>
                    </div>
                  </div>
                  <button className="mt-6 w-full py-3 bg-rs-gold/10 hover:bg-rs-gold/20 text-rs-gold font-bold rounded-lg border border-rs-gold/30 transition-all">
                    Visualizar Demo
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'sites':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">MiniSites por Dono</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar sites..."
                  className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-rs-gray rounded-lg outline-none focus:border-rs-gold text-sm w-64"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              {sitesByOwner.map((ownerGroup) => (
                <div key={ownerGroup.id} className="bg-white dark:bg-rs-dark rounded-xl border border-gray-200 dark:border-rs-gray overflow-hidden">

                  {/* Owner Header - Click to Expand */}
                  <div
                    onClick={() => setExpandedOwnerId(expandedOwnerId === ownerGroup.id ? null : ownerGroup.id)}
                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-rs-gold/20 flex items-center justify-center text-rs-goldDark dark:text-rs-gold font-bold">
                        {ownerGroup.ownerName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{ownerGroup.ownerName}</h3>
                        <p className="text-xs text-gray-500">{ownerGroup.ownerType}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">Sites</p>
                        <p className="text-lg font-bold">{ownerGroup.sites.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">Visualizações</p>
                        <p className="text-lg font-bold">{ownerGroup.totalViews}</p>
                      </div>
                      {expandedOwnerId === ownerGroup.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded Content: Sites List */}
                  {expandedOwnerId === ownerGroup.id && (
                    <div className="border-t border-gray-200 dark:border-rs-gray bg-gray-50/50 dark:bg-black/20 p-4 animate-fade-in">
                      <table className="w-full text-sm text-left">
                        <thead className="text-gray-500 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Nome do Site</th>
                            <th className="p-3">Slug</th>
                            <th className="p-3 text-center">Plano</th>
                            <th className="p-3 text-center">Views</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3 text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                          {ownerGroup.sites
                            .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map(site => (
                              <tr key={site.id} className="hover:bg-white dark:hover:bg-white/5">
                                <td className="p-3 font-medium text-gray-900 dark:text-white">{site.name}</td>
                                <td className="p-3 text-gray-500 font-mono text-xs">/{site.slug}</td>
                                <td className="p-3 text-center">
                                  <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${site.plan === 'agency' ? 'border-purple-500 text-purple-500' :
                                    site.plan === 'pro' ? 'border-rs-gold text-rs-gold' :
                                      'border-gray-500 text-gray-500'
                                    }`}>
                                    {site.plan}
                                  </span>
                                </td>
                                <td className="p-3 text-center text-gray-600 dark:text-gray-400">{site.views}</td>
                                <td className="p-3 text-center">
                                  {site.isPublished ? (
                                    <span className="text-green-500 text-[10px] font-bold flex items-center justify-center gap-1">● Online</span>
                                  ) : (
                                    <span className="text-gray-400 text-[10px] font-bold">Rascunho</span>
                                  )}
                                </td>
                                <td className="p-3 text-center">
                                  <button className="text-rs-goldDark hover:underline text-xs font-bold flex items-center justify-center gap-1 mx-auto">
                                    <Eye size={12} /> Ver
                                  </button>
                                </td>
                              </tr>
                            ))}
                          {ownerGroup.sites.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                            <tr><td colSpan={6} className="p-4 text-center text-gray-500 text-xs">Nenhum site encontrado para esta busca.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'plans':
        return (
          <div className="space-y-6 animate-fade-in text-white">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-serif font-bold dark:text-white">Gerenciar Planos</h2>
              <button
                onClick={() => setIsEditingPlans(!isEditingPlans)}
                className="bg-rs-gold text-black px-4 py-2 rounded-lg font-bold text-sm"
              >
                {isEditingPlans ? 'Cancelar Edição' : 'Editar Planos'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(tempPlans).filter(([key]) => key !== 'admin_master').map(([key, plan]: [string, PlanDefinition]) => (
                <div key={key} className="bg-white dark:bg-rs-dark p-6 rounded-xl border border-gray-200 dark:border-rs-gray relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Crown size={80} />
                  </div>

                  {isEditingPlans ? (
                    <div className="space-y-3 relative z-10">
                      <input
                        className="w-full bg-black/50 border border-rs-gray p-2' rounded"
                        value={plan.name}
                        onChange={(e) => setTempPlans({ ...tempPlans, [key]: { ...plan, name: e.target.value } })}
                      />
                      <input
                        className="w-full bg-black/50 border border-rs-gray p-2 rounded font-bold text-rs-gold"
                        value={plan.price}
                        onChange={(e) => setTempPlans({ ...tempPlans, [key]: { ...plan, price: e.target.value } })}
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          className="w-1/2 bg-black/50 border border-rs-gray p-2 rounded text-xs"
                          value={plan.maxPages}
                          onChange={(e) => setTempPlans({ ...tempPlans, [key]: { ...plan, maxPages: parseInt(e.target.value) } })}
                          placeholder="Max Sites"
                        />
                        <input
                          type="number"
                          className="w-1/2 bg-black/50 border border-rs-gray p-2 rounded text-xs"
                          value={plan.maxClients}
                          onChange={(e) => setTempPlans({ ...tempPlans, [key]: { ...plan, maxClients: parseInt(e.target.value) } })}
                          placeholder="Max Clientes"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                      <p className="text-2xl font-bold text-rs-goldDark dark:text-rs-gold mb-4">{plan.price}</p>
                      <div className="text-xs text-gray-500 mb-4">
                        Limite: {plan.maxPages === Infinity ? 'Ilimitado' : plan.maxPages} Sites | {plan.maxClients} Clientes
                      </div>
                    </>
                  )}

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="text-sm text-gray-500 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {isEditingPlans && (
              <div className="flex justify-end pt-6">
                <button
                  onClick={() => {
                    if (onUpdatePlans) onUpdatePlans(tempPlans);
                    setIsEditingPlans(false);
                    alert("Planos atualizados com sucesso!");
                  }}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg"
                >
                  Salvar Todas as Alterações
                </button>
              </div>
            )}
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6 animate-fade-in text-white">
            <h2 className="text-3xl font-serif font-bold dark:text-white">Configurações Globais</h2>
            <div className="bg-white dark:bg-rs-dark p-8 rounded-xl border border-gray-200 dark:border-rs-gray max-w-2xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Chave PIX (Plataforma)</label>
                  <input
                    className="w-full bg-black/50 border border-rs-gray p-3 rounded-lg outline-none focus:border-rs-gold"
                    value={tempSettings.pixKey}
                    onChange={(e) => setTempSettings({ ...tempSettings, pixKey: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">E-mail de Suporte</label>
                  <input
                    className="w-full bg-black/50 border border-rs-gray p-3 rounded-lg outline-none focus:border-rs-gold"
                    value={tempSettings.supportEmail}
                    onChange={(e) => setTempSettings({ ...tempSettings, supportEmail: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nome da Plataforma</label>
                  <input
                    className="w-full bg-black/50 border border-rs-gray p-3 rounded-lg outline-none focus:border-rs-gold"
                    value={tempSettings.platformName}
                    onChange={(e) => setTempSettings({ ...tempSettings, platformName: e.target.value })}
                  />
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-sm font-bold text-rs-gold uppercase mb-4 flex items-center gap-2">
                    <DollarSign size={16} /> Meios de Pagamento (Checkout)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Mercado Pago Public Key</label>
                      <input
                        className="w-full bg-black/50 border border-rs-gray p-2 rounded text-xs outline-none focus:border-rs-gold"
                        value={tempSettings.mpPublicKey}
                        onChange={(e) => setTempSettings({ ...tempSettings, mpPublicKey: e.target.value })}
                        placeholder="APP_USR-..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Mercado Pago Access Token</label>
                      <input
                        type="password"
                        className="w-full bg-black/50 border border-rs-gray p-2 rounded text-xs outline-none focus:border-rs-gold"
                        value={tempSettings.mpAccessToken}
                        onChange={(e) => setTempSettings({ ...tempSettings, mpAccessToken: e.target.value })}
                        placeholder="TEST-... ou APP_USR-..."
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      if (onUpdateSettings) onUpdateSettings(tempSettings);
                      alert("Configurações salvas com sucesso!");
                    }}
                    className="w-full bg-rs-gold text-black py-3 rounded-lg font-bold hover:bg-rs-goldDark transition-all"
                  >
                    Salvar Configurações
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'logs':
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Logs do Sistema</h2>
            <div className="bg-white dark:bg-rs-dark rounded-xl border border-gray-200 dark:border-rs-gray overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-rs-gray flex justify-between items-center">
                <h3 className="font-bold text-sm text-gray-500 uppercase">Histórico de Atividades</h3>
                <span className="text-xs text-gray-400">{logs.length} registros encontrados</span>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-black/20 text-gray-500 font-bold uppercase text-xs">
                  <tr>
                    <th className="p-4">Data/Hora</th>
                    <th className="p-4">Responsável</th>
                    <th className="p-4">Ação</th>
                    <th className="p-4">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {[...logs].reverse().map(log => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="p-4 text-gray-500 text-xs font-mono whitespace-nowrap">
                        {log.timestamp.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 dark:text-white">{log.actorName}</span>
                          <span className="text-xs text-gray-500">{log.actorEmail}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] px-2 py-1 rounded border uppercase font-bold whitespace-nowrap ${log.action === 'create_agency' ? 'border-green-500 text-green-500' :
                          log.action === 'change_plan' ? 'border-purple-500 text-purple-500' :
                            log.action === 'publish_site' ? 'border-rs-gold text-rs-gold' :
                              log.action === 'delete_item' ? 'border-red-500 text-red-500' :
                                'border-gray-500 text-gray-500'
                          }`}>
                          {log.action === 'create_agency' ? 'Criou Agência' :
                            log.action === 'change_plan' ? 'Alterou Plano' :
                              log.action === 'publish_site' ? 'Publicou Site' :
                                log.action === 'delete_item' ? 'Apagou Item' : log.action}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">
                        {log.target}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">
                        Nenhum registro de atividade encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );


      default:
        return (
          <div className="flex flex-col items-center justify-center h-96 text-gray-500">
            <AlertCircle size={48} className="mb-4 opacity-50" />
            <p>Módulo em desenvolvimento.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white overflow-hidden font-sans">

      {/* Sidebar */}
      <aside className="w-64 bg-rs-black border-r border-gray-800 flex flex-col shrink-0 z-20">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-bold text-white">A</div>
          <div>
            <h1 className="font-serif font-bold text-white leading-tight">Admin Master</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Acesso Global</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <MenuButton
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
          />
          <div className="pt-4 pb-2 px-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ecossistema</div>
          <MenuButton
            active={activeTab === 'agencies'}
            onClick={() => setActiveTab('agencies')}
            icon={<Shield size={18} />}
            label="Agências"
          />
          <MenuButton
            active={activeTab === 'clients'}
            onClick={() => setActiveTab('clients')}
            icon={<Users size={18} />}
            label="Clientes Finais"
          />
          <MenuButton
            active={activeTab === 'sites'}
            onClick={() => setActiveTab('sites')}
            icon={<Briefcase size={18} />}
            label="MiniSites"
          />

          <div className="pt-4 pb-2 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gestão</div>
          <MenuButton active={activeTab === 'agencies'} onClick={() => setActiveTab('agencies')} icon={<Briefcase size={18} />} label="Agências" />
          <MenuButton active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} icon={<Users size={18} />} label="Clientes" />
          <MenuButton active={activeTab === 'sites'} onClick={() => setActiveTab('sites')} icon={<Globe size={18} />} label="Domínios" />
          <MenuButton active={activeTab === 'packages'} onClick={() => setActiveTab('packages')} icon={<ShoppingBag size={18} />} label="Pacotes & Kits" />
          <MenuButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={18} />} label="Plataforma" />
          <MenuButton active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} icon={<Crown size={18} />} label="Planos" />

          <div className="pt-4 mt-4 border-t border-white/5">
            <MenuButton active={activeTab === 'walletpay'} onClick={() => window.open('http://localhost:3004/#/app/dashboard', '_blank')} icon={<DollarSign size={18} />} label="WalletPay" />
            <MenuButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<FileText size={18} />} label="Logs" />
          </div>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={onBackToApp}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors mb-2"
          >
            <LayoutDashboard size={18} />
            Voltar ao App
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-rs-gray px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Admin</span>
            <ChevronRight size={14} />
            <span className="text-gray-900 dark:text-white capitalize font-bold">{activeTab}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
              <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="Admin" />
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// Simple Icon for UserPlus
const UserPlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="20" y1="8" x2="20" y2="14"></line>
    <line x1="23" y1="11" x2="17" y2="11"></line>
  </svg>
);

const MenuButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${active
      ? 'bg-rs-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.2)]'
      : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
  >
    {icon}
    {label}
  </button>
);