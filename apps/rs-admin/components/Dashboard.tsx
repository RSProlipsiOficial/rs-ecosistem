import React, { useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';
import ConsultantsTable from './ConsultantsTable';
import { UsersIcon, WalletIcon, CycleIcon, ShopIcon } from './icons';
import { MARKETPLACE_URL, WALLETPAY_URL, CONSULTOR_DASHBOARD_URL, MINISITE_URL } from '../src/config/urls';
import type { Consultant } from '../types';
import { dashboardAPI, consultantsAPI } from '../src/services/api';

interface DashboardProps {
  setActiveView: (view: string) => void;
}

const defaultStats = {
  total_consultants: 0,
  active_consultants: 0,
  rota_owners: 0,
  unified_users: 0,
  total_balance: 0,
  cycles_month: 0,
  total_sales: 0,
};

const mapSupabaseConsultant = (c: any): Consultant => ({
  id: c.id,
  uuid: c.user_id || c.id,
  code: String(c.id).slice(0, 8),
  username: c.username || (c.email ? c.email.split('@')[0] : ''),
  name: c.nome,
  avatar: (!c.avatar_url || c.avatar_url.includes('0aa67016')) ? '/logo-rs.png' : c.avatar_url,
  pin: c.pin_atual || 'Consultor',
  network: 'Escritorio',
  balance: 0,
  status: c.status === 'ativo' ? 'Ativo' : c.status === 'pendente' ? 'Pendente' : 'Inativo',
  cpfCnpj: c.cpf || '',
  address: {
    street: '',
    city: c.cidade || '',
    state: c.estado || '',
    zip: c.cep || '',
  },
  contact: {
    email: c.email || '',
    phone: c.whatsapp || c.telefone || '',
  },
  bankInfo: {
    bank: '',
    agency: '',
    account: '',
    pixType: 'CPF',
    pixKey: '',
  },
  cycle: c.total_ciclos || 0,
  networkDetails: {
    directs: 0,
  },
  activationHistory: [],
  walletStatement: [],
  permissions: {
    personalDataLocked: false,
    bankDataLocked: true,
    bonus_cycle: true,
    bonus_fidelity: true,
    bonus_matrix_fidelity: true,
    bonus_leadership: true,
    bonus_career: true,
    bonus_digital: true,
    access_platform: true,
  },
  sponsor: null,
  registrationDate: c.created_at || '',
  salesHistory: [],
  commissionHistory: [],
  purchaseHistory: [],
  sigmaActive: c.status === 'ativo',
  sigmaCyclesMonth: c.total_ciclos || 0,
  careerPoints: 0,
  careerPinCurrent: c.pin_atual || 'Consultor',
  topSigmaPosition: null,
});

const Dashboard: React.FC<DashboardProps> = ({ setActiveView }) => {
  const [stats, setStats] = useState<any>(defaultStats);
  const [topConsultants, setTopConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);

  const buildWalletPayUrl = () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('consultorToken') || '';

    if (!token) {
      return WALLETPAY_URL;
    }

    const payload = {
      autoLogin: true,
      source: 'rs-admin',
      token,
    };

    const encodedPayload = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    return `${WALLETPAY_URL}/#/sso?token=${encodeURIComponent(encodedPayload)}`;
  };

  const buildEcosystemUrl = (baseUrl: string) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('consultorToken') || '';

    if (!token) {
      return baseUrl;
    }

    const payload = {
      autoLogin: true,
      source: 'rs-admin',
      token,
    };

    const encodedPayload = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    return `${baseUrl}/#/sso?token=${encodeURIComponent(encodedPayload)}`;
  };

  const loadConsultantsWithFallback = async () => {
    try {
      const response = await consultantsAPI.getAll({ limit: 5 });
      const responseData = response.data as any;
      const actualData = responseData?.data || responseData;
      const consultants = (actualData?.consultants || responseData?.consultants || actualData || []) as Consultant[];

      if (Array.isArray(consultants) && consultants.length > 0) {
        return {
          consultants: consultants.slice(0, 5),
          totalCount: consultants.length,
          activeCount: consultants.filter((c) => c.status === 'Ativo').length,
        };
      }
    } catch (error) {
      console.warn('[Dashboard] API consultants failed, using Supabase fallback:', error);
    }

    const { supabase } = await import('../src/services/supabase');
    const [recentRes, totalRes, activeRes] = await Promise.all([
      supabase
        .from('consultores')
        .select('id, user_id, nome, email, telefone, whatsapp, cpf, pin_atual, status, cidade, estado, cep, username, created_at, avatar_url, total_ciclos')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('consultores')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('consultores')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'ativo'),
    ]);

    if (recentRes.error) {
      throw recentRes.error;
    }

    return {
      consultants: (recentRes.data || []).map(mapSupabaseConsultant),
      totalCount: totalRes.count || recentRes.data?.length || 0,
      activeCount: activeRes.count || (recentRes.data || []).filter((c: any) => c.status === 'ativo').length,
    };
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      let nextStats = { ...defaultStats };
      let statsLoaded = false;

      try {
        const statsRes = await dashboardAPI.getStats();
        if (statsRes.data?.success) {
          nextStats = { ...nextStats, ...statsRes.data.stats };
          statsLoaded = true;
        } else if (statsRes.data) {
          nextStats = { ...nextStats, ...statsRes.data };
          statsLoaded = true;
        }
      } catch (error) {
        console.error('[Dashboard] Error fetching stats:', error);
      }

      try {
        const consultantsData = await loadConsultantsWithFallback();
        setTopConsultants(consultantsData.consultants);

        if (!statsLoaded || ((nextStats.total_consultants || 0) === 0 && consultantsData.totalCount > 0)) {
          nextStats = {
            ...nextStats,
            total_consultants: consultantsData.totalCount,
            active_consultants: consultantsData.activeCount,
            unified_users: Math.max(nextStats.unified_users || 0, consultantsData.totalCount),
          };
        }
      } catch (error) {
        console.error('[Dashboard] Error fetching consultants:', error);
      } finally {
        setStats(nextStats);
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="Consultores RS"
          value={loading ? '...' : stats.active_consultants.toString()}
          icon={<UsersIcon className="w-8 h-8" />}
          trend={`${stats.total_consultants} no total`}
          onClick={() => setActiveView('Consultores')}
        />
        <DashboardCard
          title="Escritorio RS"
          value={loading ? '...' : stats.rota_owners.toString()}
          icon={<UsersIcon className="w-8 h-8" />}
          trend="Painel Administrativo"
          onClick={() => window.open(buildEcosystemUrl(CONSULTOR_DASHBOARD_URL), '_blank', 'noopener,noreferrer')}
        />
        <DashboardCard
          title="Ecossistema Total"
          value={loading ? '...' : stats.unified_users.toString()}
          icon={<UsersIcon className="w-8 h-8" />}
          trend="RS + Rota Facil"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="Saldo Wallet (Total)"
          value={loading ? '...' : (stats.total_balance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={<WalletIcon className="w-8 h-8" />}
          trend="Tempo real"
          onClick={() => {
            window.open(buildWalletPayUrl(), '_blank', 'noopener,noreferrer');
          }}
        />
        <DashboardCard
          title="Ciclos do Mes"
          value={loading ? '...' : (stats.cycles_month || 0).toString()}
          icon={<CycleIcon className="w-8 h-8" />}
          trend="Acumulado"
          onClick={() => setActiveView('Matriz SIGMA')}
        />
        <DashboardCard
          title="Vendas Shop"
          value={loading ? '...' : (stats.total_sales || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={<ShopIcon className="w-8 h-8" />}
          trend="Pedidos pagos"
          onClick={() => window.open(buildEcosystemUrl(MARKETPLACE_URL), '_blank', 'noopener,noreferrer')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <DashboardCard
          title="RS MiniSite"
          value="Acesso"
          icon={<UsersIcon className="w-8 h-8" />}
          trend="Painel unificado"
          onClick={() => window.open(buildEcosystemUrl(MINISITE_URL), '_blank', 'noopener,noreferrer')}
        />
      </div>

      <div>
        <h2
          className="text-2xl font-semibold text-white mb-4 cursor-pointer hover:text-yellow-500 transition-colors"
          onClick={() => setActiveView('Consultores')}
        >
          Acesso Rapido: Consultores Recentes
        </h2>
        <ConsultantsTable
          consultants={topConsultants}
          onEdit={(_consultant) => setActiveView('Consultores')}
          onResetPassword={() => {}}
        />
      </div>
    </div>
  );
};

export default Dashboard;
