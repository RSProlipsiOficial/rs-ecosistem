import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  IconDashboard, IconGitFork, IconUsers, IconShop, IconWallet, IconMessage,
  IconChart, IconSettings, IconChevronDown, IconAward, IconHandCoins, IconStar,
  IconReceipt, IconRepeat, IconFileClock, IconBuilding2, IconTransfer,
  IconStore, IconTruck, IconLink, IconFacebook, IconUserCog, IconLock,
  IconFileText,
  // FIX: Added IconEdit to the import list as it's used in adminNavItems.
  IconEdit,
  IconSparkles, // Added for RS Studio
  IconMic, // Added for new features
} from '../../components/icons';

interface SidebarProps {
  isCollapsed: boolean;
  closeSidebar?: () => void;
}

const sigmeNavItems = [
  { name: 'Bônus Matriz SIGME', path: '/consultant/sigme/ciclo-global', icon: IconGitFork },
  { name: 'Bônus de Profundidade', path: '/consultant/sigme/bonus-profundidade', icon: IconUsers },
  { name: 'Bônus de Fidelidade', path: '/consultant/sigme/bonus-fidelidade', icon: IconRepeat },
  { name: 'Bônus Top Sigme', path: '/consultant/sigme/top-sigme', icon: IconStar },
  { name: 'Bônus Plano de Carreira', path: '/consultant/sigme/plano-carreira', icon: IconAward },
  { name: 'Relatórios de Rede', path: '/consultant/sigme/relatorios-rede', icon: IconFileText },
];

const walletNavItems = [
  { name: 'Saldo e Extrato', path: '/consultant/wallet/saldo-extrato', icon: IconWallet },
  { name: 'Cobranças', path: '/consultant/wallet/cobrancas', icon: IconReceipt },
  { name: 'Assinaturas', path: '/consultant/wallet/assinaturas', icon: IconRepeat },
  { name: 'Transferências', path: '/consultant/wallet/transferir', icon: IconTransfer },
  { name: 'Saques', path: '/consultant/wallet/saque', icon: IconHandCoins },
  { name: 'Relatórios', path: '/consultant/wallet/relatorios', icon: IconChart },
  { name: 'Configurações', path: '/consultant/wallet/configuracoes', icon: IconBuilding2 },
];

const shopNavItems = [
  { name: 'Marketplace', path: '/consultant/shop/marketplace', icon: IconStore },
  { name: 'Centro de Distribuição', path: '/consultant/shop/centro-distribuicao', icon: IconBuilding2 },
  { name: 'Dropshipping', path: '/consultant/shop/dropshipping', icon: IconTruck },
  { name: 'Links de Afiliado', path: '/consultant/shop/links-afiliado', icon: IconLink },
  { name: 'Pixels de Marketing', path: '/consultant/shop/pixels-marketing', icon: IconFacebook },
  { name: 'Encurtador de Link', path: '/consultant/shop/encurtador-link', icon: IconLink },
  { name: 'Meus Dados', path: '/consultant/shop/meus-dados', icon: IconUserCog },
];

const adminNavItems = [
  { name: 'Dados Pessoais', path: '/admin/personal-data', icon: IconUserCog },
  { name: 'Dashboard/Editor', path: '/admin/dashboard-editor', icon: IconEdit },
]

const mainNavItems = [
  { name: 'Dashboard', path: '/consultant/dashboard', icon: IconDashboard },
  { name: 'Loja RS', path: `http://${window.location.hostname}:3003`, icon: IconShop, isExternal: true },
  { name: 'RS Studio', path: '/consultant/studio', icon: IconSparkles },
  { name: 'Comunicação', path: '/consultant/comunicacao', icon: IconMessage },
];

const NavGroup: React.FC<{
  title: string;
  icon: React.ElementType;
  basePath: string;
  items: { name: string; path: string; icon: React.ElementType }[];
  isCollapsed: boolean;
  handleNavLinkClick: () => void;
}> = ({ title, icon: Icon, basePath, items, isCollapsed, handleNavLinkClick }) => {
  const location = useLocation();
  const isPathActive = location.pathname.startsWith(basePath);
  const [isOpen, setIsOpen] = useState(isPathActive);

  return (
    <div>
      <button
        onClick={() => !isCollapsed && setIsOpen(!isOpen)}
        className={`flex items-center w-full space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${isCollapsed ? 'justify-center' : 'justify-between'} ${isPathActive
          ? 'bg-brand-gray-light text-white font-semibold'
          : 'text-brand-text-dim hover:bg-brand-gray-light hover:text-white'
          }`}
      >
        <div className="flex items-center space-x-3">
          <Icon className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>{title}</span>}
        </div>
        {!isCollapsed && <IconChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </button>
      {isOpen && !isCollapsed && (
        <div className="pl-4 mt-2 space-y-1">
          {items.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={handleNavLinkClick}
              className={({ isActive }) => `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive
                ? 'bg-brand-gold/10 text-brand-gold font-semibold'
                : 'text-brand-text-dim hover:bg-brand-gray-light hover:text-brand-gold'
                }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};


const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, closeSidebar }) => {
  const handleNavLinkClick = () => {
    if (closeSidebar) {
      closeSidebar();
    }
  };

  const navLinkClasses = (isActive: boolean) =>
    `flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${isCollapsed ? 'justify-center' : ''} ${isActive
      ? 'bg-brand-gold text-brand-dark font-semibold shadow-lg shadow-brand-gold/20'
      : 'text-brand-text-dim hover:bg-brand-gray-light hover:text-brand-gold'
    }`;

  return (
    <aside className="w-full h-full bg-brand-gray border-r border-brand-gray-light flex-shrink-0 p-3 flex flex-col">
      <div className={`py-4 text-center transition-all duration-300 ${isCollapsed ? 'mb-2' : 'mb-4'}`}>
        <h1 className={`text-brand-gold text-2xl font-bold ${isCollapsed ? 'hidden' : 'block'}`}>RS Prólipsi</h1>
        <h1 className={`text-brand-gold text-2xl font-bold ${isCollapsed ? 'block' : 'hidden'}`}>RS</h1>
      </div>
      <nav className="flex flex-col space-y-2 overflow-y-auto">
        {mainNavItems.map((item) => (
          item.isExternal ? (
            <a
              key={item.name}
              href={item.path}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleNavLinkClick}
              className={navLinkClasses(false)}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </a>
          ) : (
            <NavLink key={item.name} to={item.path} onClick={handleNavLinkClick} className={({ isActive }) => navLinkClasses(isActive)}>
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          )
        ))}

        <NavGroup
          title="Painel SIGME"
          icon={IconGitFork}
          basePath="/consultant/sigme"
          items={sigmeNavItems}
          isCollapsed={isCollapsed}
          handleNavLinkClick={handleNavLinkClick}
        />

        <a
          href={`http://${window.location.hostname}:3004`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleNavLinkClick}
          className={navLinkClasses(false)}
        >
          <IconWallet className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>RS Wallet Pay</span>}
        </a>

        <NavLink
          to="/consultant/configuracoes"
          onClick={handleNavLinkClick}
          className={({ isActive }) => navLinkClasses(isActive)}
        >
          <IconSettings className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>Perfil</span>}
        </NavLink>


      </nav>
      <div className="mt-auto p-4 text-center text-xs text-gray-400">
        {!isCollapsed && <span>&copy; {new Date().getFullYear()} RS Prólipsi.</span>}
      </div>
    </aside>
  );
};

export default Sidebar;