import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import Card from '../../components/Card';
import { 
    IconWallet, 
    IconReceipt, 
    IconRepeat, 
    IconTransfer, 
    IconHandCoins, 
    IconFileClock, 
    IconChart, 
    IconBuilding2 
} from '../../components/icons';

const walletNavItems = [
  { name: 'Saldo e Extrato', path: '/consultant/wallet/saldo-extrato', icon: IconWallet },
  { name: 'Cobranças', path: '/consultant/wallet/cobrancas', icon: IconReceipt },
  { name: 'Assinaturas', path: '/consultant/wallet/assinaturas', icon: IconRepeat },
  { name: 'Transferências', path: '/consultant/wallet/transferir', icon: IconTransfer },
  { name: 'Saques', path: '/consultant/wallet/saque', icon: IconHandCoins },
  { name: 'Relatórios', path: '/consultant/wallet/relatorios', icon: IconChart },
  { name: 'Configurações', path: '/consultant/wallet/configuracoes', icon: IconBuilding2 },
];

const WalletLayout: React.FC = () => {
  const location = useLocation();
  const getPageTitle = () => {
    const currentPath = location.pathname;
    // Match more specific paths first
    if (currentPath.endsWith('/consultant/wallet')) return 'Saldo e Extrato';
    const item = walletNavItems.find(item => currentPath.startsWith(item.path));
    return item?.name || 'Central Financeira';
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-gold">RS Wallet Pay</h1>
        <p className="text-gray-400 mt-1">{getPageTitle()}</p>
      </div>

      <Card className="p-2 sm:p-3">
        <nav className="flex flex-wrap items-center gap-2">
          {walletNavItems.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-brand-gold text-brand-dark font-semibold shadow-md shadow-brand-gold/20' : 'text-gray-300 hover:bg-brand-gray-light'}`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </Card>
      
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default WalletLayout;