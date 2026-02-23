import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import Card from '../../components/Card';
import { 
    IconStore,
    IconTruck,
    IconLink,
    IconFacebook,
    IconUserCog,
    IconBuilding2,
    IconAward,
} from '../../components/icons';

const shopNavItems = [
    { name: 'Marketplace', path: '/consultant/shop/marketplace', icon: IconStore },
    { name: 'Centro de Distribuição', path: '/consultant/shop/centro-distribuicao', icon: IconBuilding2 },
    { name: 'Dropshipping', path: '/consultant/shop/dropshipping', icon: IconTruck },
    { name: 'Links de Afiliado', path: '/consultant/shop/links-afiliado', icon: IconLink },
    { name: 'Pixels de Marketing', path: '/consultant/shop/pixels-marketing', icon: IconFacebook },
    { name: 'Encurtador de Link', path: '/consultant/shop/encurtador-link', icon: IconLink },
    { name: 'Meus Dados', path: '/consultant/shop/meus-dados', icon: IconUserCog },
];

const ShopLayout: React.FC = () => {
  const location = useLocation();
  const getPageTitle = () => {
    const currentPath = location.pathname;
    const item = shopNavItems.find(item => currentPath.startsWith(item.path));
    return item?.name || 'Central de Vendas';
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-gold">RS Shop</h1>
        <p className="text-gray-400 mt-1">{getPageTitle()}</p>
      </div>
      
      <Card className="p-2 sm:p-3">
        <nav className="flex flex-wrap items-center gap-2">
          {shopNavItems.map(item => (
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

export default ShopLayout;