import React from 'react';
import DashboardCard from './DashboardCard';
import ConsultantsTable from './ConsultantsTable';
import { UsersIcon, WalletIcon, CycleIcon, ShopIcon } from './icons';
import { MARKETPLACE_URL, WALLETPAY_URL } from '@/src/config/urls';
import type { Consultant } from '../types';

interface DashboardProps {
  setActiveView: (view: string) => void;
}

// Cleared mock data
const mockConsultants: Consultant[] = [];

const Dashboard: React.FC<DashboardProps> = ({ setActiveView }) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Consultores Ativos"
          value="0"
          icon={<UsersIcon className="w-8 h-8" />}
          trend="Nenhum dado"
          onClick={() => setActiveView('Consultores')}
        />
        <DashboardCard
          title="Saldo Wallet (Total)"
          value="R$ 0,00"
          icon={<WalletIcon className="w-8 h-8" />}
          trend="Nenhum dado"
          onClick={() => {
            const token = localStorage.getItem('adminToken') || '';
            const url = `${WALLETPAY_URL}/#/login?token=${encodeURIComponent(token)}`;
            window.open(url, '_blank', 'noopener,noreferrer');
          }}
        />
        <DashboardCard
          title="Ciclos do Mês"
          value="0"
          icon={<CycleIcon className="w-8 h-8" />}
          trend="Nenhum período"
          onClick={() => setActiveView('Ciclo global')}
        />
        <DashboardCard
          title="Vendas Shop"
          value="R$ 0,00"
          icon={<ShopIcon className="w-8 h-8" />}
          trend="Nenhum dado"
          onClick={() => window.open(MARKETPLACE_URL, '_blank', 'noopener,noreferrer')}
        />
      </div>

      {/* Table Section */}
      <div>
        <h2
          className="text-2xl font-semibold text-white mb-4 cursor-pointer hover:text-yellow-500 transition-colors"
          onClick={() => setActiveView('Consultores')}
        >
          Acesso Rápido: Consultores
        </h2>
        <ConsultantsTable consultants={mockConsultants} onEdit={(_consultant) => setActiveView('Consultores')} onResetPassword={() => { }} />
      </div>
    </div>
  );
};

export default Dashboard;