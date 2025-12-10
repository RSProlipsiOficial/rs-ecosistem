import React, { useState, useEffect } from 'react';
import { MARKETPLACE_URL, MARKETPLACE_ADMIN_DASHBOARD_EDITOR_URL, WALLETPAY_URL, CONSULTOR_DASHBOARD_URL } from '@/src/config/urls';
import ExternalLinkItem from './ExternalLinkItem';
import {
  DashboardIcon, UsersIcon, CycleIcon, CareerIcon, WalletIcon, SettingsIcon,
  ChevronRightIcon, StarIcon, TruckIcon, BuildingStorefrontIcon,
  ChatBubbleLeftIcon, GridIcon, ClipboardDocumentListIcon,
  ArrowsRightLeftIcon, DocumentTextIcon, QrCodeIcon, CreditCardIcon,
  ChartBarIcon, ArrowTrendingUpIcon, ArrowDownTrayIcon, PuzzlePieceIcon
} from './icons';

interface SidebarProps {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  setActiveView: (view: string) => void;
  activeView: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, setSidebarOpen, setActiveView, activeView }) => {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const handleMenuClick = (menu: string) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleViewChange = (view: string) => {
    if (activeView === view) return; // Avoid re-render if already active

    setActiveView(view);
    if (window.innerWidth < 768) { // md breakpoint
      setSidebarOpen(false);
    }
  };

  const NavItem: React.FC<{ icon?: React.ReactNode; label: string; view: string; level?: number, isChild?: boolean }> = ({ icon, label, view, level = 0, isChild = false }) => {
    const isActive = activeView === view;

    if (!isChild) {
      return (
        <li>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleViewChange(view); }}
            className={`flex items-center w-full py-3 px-4 my-1 text-sm font-semibold rounded-lg transition-all duration-200 ${isActive
              ? 'bg-[#FFD700] text-black shadow-lg'
              : 'text-[#9CA3AF] hover:text-[#FFD700] hover:bg-[#2A2A2A]'
              }`}
          >
            {icon && <span className="mr-3">{icon}</span>}
            <span>{label}</span>
          </a>
        </li>
      )
    }

    return (
      <li>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); handleViewChange(view); }}
          style={{ paddingLeft: `${1.5 + level * 1.5}rem` }}
          className={`flex items-center w-full py-2 my-0.5 text-sm font-medium transition-all duration-200 rounded-md ${isActive
            ? 'text-[#FFD700] font-semibold'
            : 'text-[#9CA3AF] hover:text-[#FFD700] hover:bg-[#2A2A2A]'
            }`}
        >
          {icon && <span className="mr-2 h-4 w-4">{icon}</span>}
          <span>{label}</span>
        </a>
      </li>
    );
  };

  const CollapsibleNavItem: React.FC<{ icon: React.ReactNode; label: string; menuKey: string; children: React.ReactNode; level?: number }> = ({ icon, label, menuKey, children, level = 0 }) => {
    const isOpen = openMenus[menuKey];

    const isChildActive = React.Children.toArray(children).some(child => {
      if (!React.isValidElement(child)) return false;

      const checkActive = (c: React.ReactElement): boolean => {
        if (c.props.view === activeView) return true;
        if (c.props.children) {
          return React.Children.toArray(c.props.children).some(grandchild =>
            React.isValidElement(grandchild) && checkActive(grandchild)
          );
        }
        return false;
      };

      return checkActive(child as React.ReactElement);
    });

    // Effect to auto-open if a child is active on load
    useEffect(() => {
      if (isChildActive && !isOpen) {
        handleMenuClick(menuKey);
      }
    }, [isChildActive, isOpen, menuKey]);


    return (
      <li style={{ paddingLeft: `${level * 0.5}rem` }}>
        <button
          onClick={() => handleMenuClick(menuKey)}
          className={`flex items-center justify-between w-full py-3 px-4 my-1 text-sm font-semibold text-left rounded-lg transition-all duration-200 ${isOpen || isChildActive ? 'text-[#E5E7EB] bg-[#2A2A2A]' : 'text-[#9CA3AF] hover:text-[#FFD700] hover:bg-[#2A2A2A]'
            }`}
        >
          <div className="flex items-center">
            <span className="mr-3">{icon}</span>
            <span>{label}</span>
          </div>
          <ChevronRightIcon className={`w-4 h-4 mr-1 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
        </button>
        <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isOpen ? 'max-h-[1000px]' : 'max-h-0'}`}>
          <ul className="pt-1">
            {React.Children.map(children, child =>
              React.isValidElement(child)
                ? React.cloneElement(child, { ...child.props, level: level + 1, isChild: true })
                : child
            )}
          </ul>
        </div>
      </li>
    );
  };

  const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <li className="px-4 pt-4 pb-2 text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">{title}</li>
  );

  return (
    <>
      <div className={`fixed inset-0 z-20 bg-black/50 transition-opacity md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
      <aside className={`fixed top-0 left-0 z-30 w-64 h-full bg-[#1E1E1E] border-r border-[#2A2A2A] flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-16 border-b border-[#2A2A2A] bg-[#121212]">
          <h1 className="text-xl font-bold text-[#FFD700]">RS Prólipsi</h1>
        </div>
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <ul className="space-y-1">
            <NavItem icon={<DashboardIcon className="w-6 h-6" />} label="Painel" view="Dashboard" />

            <SectionHeader title="Gestão" />

            <NavItem icon={<UsersIcon className="w-6 h-6" />} label="Consultores" view="Consultores" />

            <CollapsibleNavItem icon={<SettingsIcon className="w-6 h-6" />} label="Admin Consultor" menuKey="AdminConsultor">
              <NavItem label="Dados Pessoais" view="Admin Dados Pessoais" />
              {(typeof window !== 'undefined' && (['admin', 'super_admin'].includes(localStorage.getItem('rs-role') || '') || (localStorage.getItem('rs-user-permissions') || '').includes('super_admin')))
                ? (
                  <>
                    <NavItem label="Configurações do Painel" view="Admin Configurações do Painel" />
                    <NavItem label="Editor Layout (Consultor)" view="Admin Dashboard Editor" />
                    <NavItem label="Editor Layout (MktPlace)" view="Admin Marketplace Editor" />
                  </>
                )
                : null}
              <ExternalLinkItem
                href={CONSULTOR_DASHBOARD_URL}
                icon={<UsersIcon className="w-5 h-5" />}
                label="Painel do Consultor"
                ariaLabel="Abrir painel do consultor em nova aba"
              />
            </CollapsibleNavItem>

            {/* Admin Marketplace moved to Admin Consultor > Configurações do Painel (tab). No menu duplicado aqui. */}

            {/* Painel SIGME removido: centralização em Configurações SIGMA */}

            <CollapsibleNavItem icon={<PuzzlePieceIcon className="w-6 h-6" />} label="Configurações SIGMA" menuKey="ConfigSIGMA">
              <NavItem label="Matriz SIGMA" view="Matriz SIGMA" />
              <NavItem label="Top SIGME" view="Top SIGME" />
              <NavItem label="Bônus Fidelidade" view="Bônus Fidelidade" />

              <CollapsibleNavItem icon={<CareerIcon className="w-5 h-5" />} label="Plano de Carreira" menuKey="Carreira">
                <NavItem label="Tabela PINs" view="Tabela PINs" />
                <NavItem label="Relatórios" view="Relatórios Carreira" />
              </CollapsibleNavItem>
            </CollapsibleNavItem>

            {/* Marketplace - External Link */}
            <ExternalLinkItem
              href={MARKETPLACE_URL}
              icon={<BuildingStorefrontIcon className="w-6 h-6" />}
              label="Marketplace"
              ariaLabel="Abrir Marketplace em nova aba"
            />

            {/* WalletPay - External Link */}
            <ExternalLinkItem
              href={WALLETPAY_URL}
              icon={<WalletIcon className="w-6 h-6" />}
              label="WalletPay"
              ariaLabel="Abrir WalletPay em nova aba"
            />

            {/* WalletPay internal item removed as requested */}

            <SectionHeader title="Ferramentas" />

            <NavItem icon={<ChatBubbleLeftIcon className="w-6 h-6" />} label="Comunicação" view="Communication" />

            <NavItem icon={<SettingsIcon className="w-6 h-6" />} label="Configurações Gerais" view="Configurações" />
          </ul>
        </nav>
        <div className="p-4 mt-auto border-t border-[#2A2A2A]">
          <p className="text-center text-xs text-[#9CA3AF]">&copy; 2025 RS Prólipsi.</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
