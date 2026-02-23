import React, { useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';
import ConsultantsTable from './ConsultantsTable';
import { UsersIcon, WalletIcon, CycleIcon, ShopIcon } from './icons';
import { MARKETPLACE_URL, WALLETPAY_URL } from '../src/config/urls';
import type { Consultant } from '../types';
import { dashboardAPI, consultantsAPI } from '../src/services/api';

interface DashboardProps {
  setActiveView: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveView }) => {
  const [stats, setStats] = useState<any>({
    total_consultants: 0,
    active_consultants: 0,
    rota_owners: 0,
    unified_users: 0,
    total_balance: 0,
    cycles_month: 0,
    total_sales: 0
  });
  const [topConsultants, setTopConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // Carregar estatísticas
      try {
        console.log('[Dashboard] Fetching stats...');
        const statsRes = await dashboardAPI.getStats();
        if (statsRes.data?.success) {
          console.log('[Dashboard] Stats loaded:', statsRes.data.stats);
          setStats(statsRes.data.stats);
        } else if (statsRes.data) {
          // Fallback para caso retorno direto
          setStats(statsRes.data);
        }
      } catch (error) {
        console.error('[Dashboard] Error fetching stats:', error);
      }

      // Carregar consultores recentes
      try {
        const consRes = await consultantsAPI.getAll({ limit: 5 });
        if (consRes.data?.success) {
          setTopConsultants(consRes.data.consultants.slice(0, 5));
        }
      } catch (error) {
        console.error('[Dashboard] Error fetching consultants:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="Consultores RS"
          value={loading ? "..." : stats.active_consultants.toString()}
          icon={<UsersIcon className="w-8 h-8" />}
          trend={`${stats.total_consultants} no total`}
          onClick={() => setActiveView('Consultores')}
        />
        <DashboardCard
          title="Rota Fácil"
          value={loading ? "..." : stats.rota_owners.toString()}
          icon={<UsersIcon className="w-8 h-8" />}
          trend="Painel Administrativo"
          onClick={() => window.open('http://localhost:8080', '_blank', 'noopener,noreferrer')}
        />
        <DashboardCard
          title="Ecossistema Total"
          value={loading ? "..." : stats.unified_users.toString()}
          icon={<UsersIcon className="w-8 h-8" />}
          trend="RS + Rota Fácil"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="Saldo Wallet (Total)"
          value={loading ? "..." : (stats.total_balance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={<WalletIcon className="w-8 h-8" />}
          trend="Tempo real"
          onClick={() => {
            const token = localStorage.getItem('adminToken') || '';
            const url = `${WALLETPAY_URL}/#/login?token=${encodeURIComponent(token)}`;
            window.open(url, '_blank', 'noopener,noreferrer');
          }}
        />
        <DashboardCard
          title="Ciclos do Mês"
          value={loading ? "..." : (stats.cycles_month || 0).toString()}
          icon={<CycleIcon className="w-8 h-8" />}
          trend="Acumulado"
          onClick={() => setActiveView('Matriz SIGMA')}
        />
        <DashboardCard
          title="Vendas Shop"
          value={loading ? "..." : (stats.total_sales || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={<ShopIcon className="w-8 h-8" />}
          trend="Pedidos pagos"
          onClick={() => window.open(MARKETPLACE_URL, '_blank', 'noopener,noreferrer')}
        />
      </div>

      {/* Table Section */}
      <div>
        <h2
          className="text-2xl font-semibold text-white mb-4 cursor-pointer hover:text-yellow-500 transition-colors"
          onClick={() => setActiveView('Consultores')}
        >
          Acesso Rápido: Consultores Recentes
        </h2>
        <ConsultantsTable
          consultants={topConsultants}
          onEdit={(_consultant) => setActiveView('Consultores')}
          onResetPassword={() => { }}
        />
      </div>
    </div>
  );
};

export default Dashboard;