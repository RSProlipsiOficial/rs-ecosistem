import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  IconDashboard, IconTransactions, IconPayments, IconSparkles, IconCard,
  IconReports, IconSettings, IconUsers, IconShoppingBag
} from '../constants';
import ComingSoonModal from './ComingSoonModal';

interface SidebarProps {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

const navSections = [
  {
    title: 'GERAL',
    items: [
      { to: '/app/dashboard', icon: IconDashboard, label: 'Dashboard' },
      { to: '/app/reports', icon: IconReports, label: 'Relatórios' },
    ]
  },
  {
    title: 'RS WALLET PAY',
    items: [
      { to: '/app/transactions', icon: IconTransactions, label: 'Extrato' },
      { to: '/app/payments', icon: IconPayments, label: 'Pagamentos' },
      { to: '/app/cards', icon: IconCard, label: 'Cartões' },
    ]
  },
  {
    title: 'VENDAS',
    items: [
      { to: '/app/sales', icon: IconShoppingBag, label: 'Clientes & Vendas' },
    ]
  },
  {
    title: 'REDE & MARKETING',
    items: [
        { to: '/app/network', icon: IconUsers, label: 'Minha Rede' },
        { to: '/app/marketing', icon: IconSparkles, label: 'Marketing' },
    ]
  },
];

const NavItem: React.FC<{ to: string, icon: React.FC<{ className?: string }>, label: string, onClick: () => void }> = ({ to, icon: Icon, label, onClick }) => (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-gold/10 text-gold'
            : 'text-text-body hover:bg-surface hover:text-text-title'
        }`
      }
    >
      <Icon className="w-5 h-5" />
      <span className="ml-4 font-medium">{label}</span>
    </NavLink>
);

const CollapsibleNavItem: React.FC<{ 
    icon: React.FC<{ className?: string }>;
    label: string;
    subItems: { to: string, label: string }[];
    onClick: () => void;
}> = ({ icon: Icon, label, subItems, onClick }) => {
    const { pathname } = useLocation();
    const isParentActive = subItems.some(item => pathname.startsWith(item.to));
    const [isOpen, setIsOpen] = useState(isParentActive);

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsOpen(!isOpen);
    };

    return (
        <>
            <a
                href="#"
                onClick={handleToggle}
                className={`flex items-center justify-between p-3 my-1 rounded-lg transition-colors duration-200 ${
                    isParentActive
                        ? 'bg-gold/10 text-gold'
                        : 'text-text-body hover:bg-surface hover:text-text-title'
                }`}
            >
                <div className="flex items-center">
                    <Icon className="w-5 h-5" />
                    <span className="ml-4 font-medium">{label}</span>
                </div>
                <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </a>
            {isOpen && (
                <ul className="pl-8 border-l border-border ml-5 py-1">
                    {subItems.map(item => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                onClick={onClick} // This will close the mobile sidebar
                                className={({ isActive }) =>
                                    `flex items-center py-2 px-3 my-1 text-sm rounded-md transition-colors ${
                                    isActive
                                        ? 'text-gold font-semibold'
                                        : 'text-text-body hover:bg-surface hover:text-text-title'
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, setSidebarOpen }) => {
  const [showComingSoon, setShowComingSoon] = useState(false);

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-card text-text-body flex flex-col z-40
                    transform transition-transform duration-300 ease-in-out
                    lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-center h-20 border-b border-border">
          <h1 className="text-2xl font-bold text-gold">RS WalletPay</h1>
        </div>
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          {navSections.map(section => (
            <div key={section.title} className="mb-4">
              <h2 className="px-3 py-2 text-xs font-bold uppercase text-text-soft tracking-wider">{section.title}</h2>
              <ul>
                {section.items.map((item: any) => (
                  <li key={item.label}>
                    {item.subItems ? (
                      <CollapsibleNavItem icon={item.icon} label={item.label} subItems={item.subItems} onClick={() => setSidebarOpen(false)} />
                    ) : (
                      <NavItem to={item.to} icon={item.icon} label={item.label} onClick={() => setSidebarOpen(false)} />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
           <NavItem to="/app/settings" icon={IconSettings} label="Configurações" onClick={() => setSidebarOpen(false)} />
          <button 
            onClick={() => setShowComingSoon(true)}
            className="w-full text-left flex items-center p-3 mt-1 rounded-lg hover:bg-surface hover:text-gold transition-colors text-text-body"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span className="ml-4 font-medium">Sair</span>
          </button>
        </div>
      </aside>
      <ComingSoonModal isOpen={showComingSoon} onClose={() => setShowComingSoon(false)} featureName="Sair" />
    </>
  );
};

export default Sidebar;
